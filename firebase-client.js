/**
 * OP RPG • Ponte Firebase para GitHub Pages (sem Node / bundler / backend).
 * Os dados de configuração ficam no início de firebase-config.js.
 * SDK modular servido diretamente pelo CDN oficial do Firebase.
 *
 * Os documentos estão em /characters/{codigo}. Códigos públicos permitem leitura;
 * edição exige autenticação e autorização validada pelas regras do Firestore.
 */
const sdkVersion = '13.3.0';
const cfg = window.OP_RPG_FIREBASE_CONFIG;
const configured = !!(cfg && cfg.apiKey && cfg.projectId && cfg.appId &&
  !String(cfg.apiKey).includes('COLE_AQUI') &&
  !String(cfg.projectId).startsWith('SEU-') &&
  !String(cfg.appId).startsWith('SEU_'));
const signal = (name) => window.dispatchEvent(new CustomEvent(name));
const friendly = (error) => {
  const code=error?.code||'';
  const translations={
    'auth/email-already-in-use':'Este nome de usuário ou e-mail já está em uso.',
    'auth/invalid-email':'E-mail inválido.',
    'auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-credential':'Nome de usuário/e-mail ou senha incorretos.',
    'auth/popup-closed-by-user':'O login com Google foi cancelado.',
    'auth/unauthorized-domain':'Autorize o domínio do GitHub Pages em Firebase Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':'Ative o provedor de login no Firebase Authentication.',
    'permission-denied':'A operação foi bloqueada pelas regras do Firestore. Verifique firestore.rules e sua permissão de acesso.',
    'unavailable':'O Firebase está temporariamente indisponível. Sua cópia local foi mantida.',
    'resource-exhausted':'O limite de uso do Firebase foi atingido.',
  };
  return new Error(translations[code]||error?.message||String(error));
};
function makeCode(){
  const alphabet='abcdefghjkmnpqrstuvwxyz23456789';
  const nums=new Uint32Array(6);crypto.getRandomValues(nums);
  const str=Array.from(nums,x=>alphabet[x%alphabet.length]).join('');
  return str.slice(0,3)+'-'+str.slice(3);
}
/** Login por nome sem expor e-mails de usuários no Firestore.
 * O Firebase Email/Password autentica um endereço sintético reservado;
 * não há recuperação de senha por e-mail para contas criadas assim.
 * Contas antigas que usam e-mail continuam podendo entrar digitando-o.
 */
const aliasDomain='players.grandlinerpg.invalid';
function loginEmail(value,register=false){
  const v=String(value||'').trim().toLowerCase();
  if(!register&&v.includes('@'))return v;
  if(!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(v)||/[._-]$/.test(v))
    throw Error('O nome de usuário deve ter 3 a 24 caracteres: letras sem acento, números, ponto, hífen ou sublinhado.');
  return v+'@'+aliasDomain;
}
function usernameOf(email){
  const suffix='@'+aliasDomain;
  return String(email||'').toLowerCase().endsWith(suffix)?String(email).slice(0,-suffix.length):'';
}
function checkSize(character){
  const bytes=new TextEncoder().encode(JSON.stringify(character)).length;
  if(bytes>860_000)throw new Error('A ficha excede o tamanho recomendado do Firestore (860 KB). Reduza as imagens do personagem ou exporte um backup JSON.');
}
if(!configured){
  window.OPFB={configured:false,ready:false,user:null,error:'Configure o arquivo firebase-config.js para ativar a nuvem.'};
  signal('oprpg-firebase-ready');
}else{
  try{
    const [appPkg,authPkg,fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-firestore.js`)
    ]);
    const app=appPkg.initializeApp(cfg),auth=authPkg.getAuth(app),db=fs.getFirestore(app);
    const col=fs.collection(db,'characters');
    const api={
      configured:true,ready:true,user:null,error:null,
      async register(username,password){try{return await authPkg.createUserWithEmailAndPassword(auth,loginEmail(username,true),password)}catch(e){throw friendly(e)}},
      async login(usernameOrEmail,password){try{return await authPkg.signInWithEmailAndPassword(auth,loginEmail(usernameOrEmail),password)}catch(e){throw friendly(e)}},
      async google(){try{return await authPkg.signInWithPopup(auth,new authPkg.GoogleAuthProvider())}catch(e){throw friendly(e)}},
      async logout(){await authPkg.signOut(auth)},
      async create(character){
        if(!auth.currentUser)throw Error('Faça login para publicar uma ficha.');
        checkSize(character);
        for(let i=0;i<12;i++){
          const code=makeCode(),ref=fs.doc(col,code);
          try{
            await fs.runTransaction(db,async(tx)=>{
              const found=await tx.get(ref);
              if(found.exists())throw Error('CODE_COLLISION');
              tx.set(ref,{
                ownerId:auth.currentUser.uid, editors:[],
                character,revision:1,
                createdAt:fs.serverTimestamp(), updatedAt:fs.serverTimestamp()
              });
            });
            return await api.read(code);
          }catch(e){if(e.message==='CODE_COLLISION')continue;throw friendly(e)}
        }
        throw Error('Não foi possível gerar um código livre. Tente novamente.');
      },
      async read(rawCode){
        const code=String(rawCode||'').trim().toLowerCase();
        if(!/^[a-z0-9]{3}-[a-z0-9]{3}$/.test(code))throw Error('Código inválido. Use o formato abc-123.');
        try{
          const snap=await fs.getDoc(fs.doc(col,code));
          if(!snap.exists())throw Error('Nenhum personagem encontrado para esse código.');
          return {code,...snap.data()};
        }catch(e){throw friendly(e)}
      },
      async mine(){
        if(!auth.currentUser)return [];
        try{
          const q=fs.query(col,fs.where('ownerId','==',auth.currentUser.uid));
          const snaps=await fs.getDocs(q);
          return snaps.docs.map(s=>({code:s.id,...s.data()}));
        }catch(e){throw friendly(e)}
      },
      async update(code,character,expectedRevision){
        if(!auth.currentUser)throw Error('Faça login para salvar.');
        checkSize(character);
        const ref=fs.doc(col,code);
        try{
          const newRevision=await fs.runTransaction(db,async tx=>{
            const snap=await tx.get(ref);
            if(!snap.exists())throw Error('Esta ficha não existe mais na nuvem.');
            const old=snap.data();
            if(old.revision!==expectedRevision)throw Error('CONFLICT');
            tx.update(ref,{character,revision:old.revision+1,updatedAt:fs.serverTimestamp()});
            return old.revision+1;
          });
          return {revision:newRevision};
        }catch(e){throw e.message==='CONFLICT'?e:friendly(e)}
      },
      async setEditors(code,editors,expectedRevision){
        if(!auth.currentUser)throw Error('Faça login.');
        const ref=fs.doc(col,code),clean=[...new Set(editors)].filter(x=>typeof x==='string' && x.length>=12 && x.length<=128);
        if(clean.length>12)throw Error('Máximo de 12 editores por personagem.');
        try{
          const result=await fs.runTransaction(db,async tx=>{
            const snap=await tx.get(ref);
            if(!snap.exists())throw Error('Ficha não encontrada.');
            const data=snap.data();
            if(data.revision!==expectedRevision)throw Error('CONFLICT');
            tx.update(ref,{editors:clean,revision:data.revision+1,updatedAt:fs.serverTimestamp()});
            return {editors:clean,revision:data.revision+1};
          });
          return result;
        }catch(e){throw e.message==='CONFLICT'?e:friendly(e)}
      },
      async remove(code){
        if(!auth.currentUser)throw Error('Faça login.');
        try{await fs.deleteDoc(fs.doc(col,code))}catch(e){throw friendly(e)}
      }
    };
    window.OPFB=api;
    signal('oprpg-firebase-ready');
    authPkg.onAuthStateChanged(auth,user=>{
      api.user=user?{uid:user.uid,email:usernameOf(user.email)?'':(user.email||''),username:usernameOf(user.email),displayName:usernameOf(user.email)||(user.displayName||'')}:null;
      signal('oprpg-firebase-auth');
    });
  }catch(e){
    window.OPFB={configured:true,ready:false,user:null,error:friendly(e).message};
    signal('oprpg-firebase-ready');
  }
}
