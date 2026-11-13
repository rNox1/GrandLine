# OP RPG — Ficha Digital • GitHub Pages + Firebase

Esta é a versão estática para GitHub Pages da ficha OP RPG 2.1. **Não é necessário Cloudflare, servidor Node, banco SQL ou executar `npm install`**.

## Conteúdo da pasta

- `index.html` — ficha completa (o visual e as regras já estão incorporados).
- `firebase-config.js` — já configurado para o projeto Firebase **grandlinerpg**. Contém apenas a configuração pública do app.
- `firebase-client.js` — conexão Firebase Authentication e Cloud Firestore.
- `firestore.rules` — **regras de segurança obrigatórias**; instalar no Console Firebase.
- `.nojekyll` — evita processamento Jekyll ao servir pelo GitHub Pages.
- `LEIA-ME.md` — estas instruções.

## 1. Criar o projeto no Firebase (feito uma vez)

1. **Já feito:** você criou o projeto `grandlinerpg` no Firebase Console.
2. **Já feito:** você registrou seu aplicativo Web e forneceu o `firebaseConfig`.
3. **Já feito:** o arquivo `firebase-config.js` contém os dados públicos do projeto `grandlinerpg`.
4. **Ação necessária no Firebase Console:** em **Authentication > Sign-in method**, ative **Email/Password** e **Google** (os dois são necessários).
5. Em **Authentication > Settings > Authorized domains**, adicione **`rnox1.github.io`** (sem `https://`, sem caminho e sem barra) e também qualquer domínio próprio que utilizar.
6. Em **Firestore Database**, crie um banco (modo de produção é recomendado). Escolha a região preferida. Na aba **Rules**, substitua as regras pelas que estão em **`firestore.rules`** e clique em **Publish**.

**ATENÇÃO:** Sem publicar `firestore.rules`, consultas e gravações podem ser bloqueadas, ou o banco pode ficar inseguro se estiver no modo de teste. As regras garantem que apenas o dono e os UIDs dos editores autorizados possam gravar e que somente o dono altere permissões. O código público permite consulta à ficha (não coloque informações privadas no personagem).

## 2. Publicar pelo GitHub Pages

1. **Já feito:** você criou o repositório `rNox1/GrandLine`.
2. **Extraia o ZIP e envie todos os arquivos desta pasta para a RAIZ do repositório**, deixando `index.html` e `firebase-config.js` lado a lado. Não envie uma pasta extra envolvendo tudo.
3. GitHub → **Settings > Pages** → **Build and deployment** → **Deploy from a branch** → selecione `main` e pasta `/(root)` → **Save**.
4. Quando o GitHub publicar, o endereço normalmente será `https://rnox1.github.io/GrandLine/`.
5. Confirme que o domínio `rnox1.github.io` está autorizado no Firebase Authentication.
6. Abra o endereço **HTTPS**, clique em **☁ Nuvem**, registre-se ou faça login e publique um personagem.

Se você colocar os arquivos na raiz de um repositório chamado `rnox1.github.io`, a URL normalmente é `https://seuusuario.github.io/`.

### Onde exatamente colocar as chaves?

Já inseridas em `firebase-config.js`, no topo (identificadores públicos):

```js
window.OP_RPG_FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'grandlinerpg.firebaseapp.com',
  projectId: 'grandlinerpg',
  storageBucket: 'grandlinerpg.firebasestorage.app',
  messagingSenderId: '482677427140',
  appId: '1:482677427140:web:f44cb9caac7d1eff4c7291'
};
```

`firebaseConfig` contém **identificadores públicos do aplicativo web**, não credenciais de administrador. **Nunca** envie arquivo JSON de conta de serviço, chave privada de Firebase Admin, tokens pessoais ou senhas para o GitHub.

## 3. Como usar

- **Login**: cadastre um nome de usuário (3 a 24 caracteres, letras sem acento, números, ponto, hífen e `_`) e senha; ou entre com Google. O Firebase autentica nomes por um endereço sintético interno. **Não há recuperação por e-mail da senha de contas criadas apenas com nome**; guarde sua senha. Contas antigas de e-mail/senha ainda podem entrar usando o e-mail.
- **Criar**: faça login, clique em Criar e finalize a ficha. O aplicativo a publica automaticamente e gera código `abc-123`.
- **Salvar**: as alterações da ficha autorizada são sincronizadas automaticamente após um intervalo curto, além do botão **Salvar agora**. A cópia local continua no navegador em caso de falha na rede.
- **Abrir por código**: clique em **☁ Nuvem**, informe `abc-123`. É possível consultar uma ficha pública mesmo sem estar logado.
- **Permitir editar**: o amigo faz login em sua conta e copia o **UID** mostrado em **☁ Nuvem**. O proprietário abre a própria ficha, acessa **Permissões de edição** e adiciona o UID do amigo. Ele então abre a ficha pelo mesmo código, podendo salvar. O proprietário pode revogar esse UID a qualquer momento.
- **Copiar**: abre uma cópia independente com novo identificador local e, se conectado, um **novo código online**. Nunca altera o original.
- **Exportar JSON**: exporta **só o personagem aberto**, sem permissões nem credenciais.
- **Importar JSON**: adiciona **uma** ficha nova à lista; não apaga as fichas existentes. Também aceita backups antigos e importa apenas o personagem que estava selecionado neles.
- **Carregar minhas fichas**: depois de entrar em outro dispositivo, clique **☁ Nuvem → Carregar minhas fichas**. O site as busca na sua conta Firebase.
- **Excluir da nuvem**: somente o proprietário; o registro remoto é excluído, mas a cópia local permanece. Apagar apenas a cópia local não exclui o registro online.

## 4. Como funciona a segurança

As fichas estão na coleção Firestore `characters`, com o documento identificado pelo código curto `abc-123`. Cada registro possui:

- `ownerId`: UID do dono autenticado no Firebase;
- `editors`: lista de UIDs permitidos;
- `character`: dados da ficha;
- `revision`: versão para evitar sobrescrever alterações simultâneas;
- `createdAt` e `updatedAt`.

**Visualizar pelo código não dá permissão de editar.** A interface mostra apenas leitura e o Firestore impede que visitantes não autorizados gravem. Um editor não consegue alterar as permissões. **Não é necessário compartilhar senha nem API key com seus amigos.**

As imagens do personagem são guardadas como dados compactados **dentro do documento da ficha**, evitando exigir Firebase Storage. O Firestore limita o tamanho dos documentos: o site interrompe salvamentos acima de ~860 KB e orienta a reduzir imagens. Se usar fotos grandes, compacte antes de enviar.

A aplicação utiliza o SDK modular do Firebase diretamente do CDN oficial (`www.gstatic.com`). Por isso, o GitHub Pages precisa de internet e HTTPS; o HTML aberto como arquivo local continua útil para fichas offline, mas não oferece login confiável.

## 5. Problemas comuns

- **"Configure firebase-config.js"**: ainda há valores `COLE_AQUI` ou `SEU-PROJETO` no arquivo, ou o arquivo não está ao lado de `index.html`.
- **"unauthorized-domain"**: adicione `rnox1.github.io` em Authentication > Settings > Authorized domains.
- **"permission-denied"**: publique `firestore.rules`; entre na conta correta; para editar a ficha de outra pessoa, solicite autorização de seu UID.
- **O personagem não apareceu em outro dispositivo**: entre na mesma conta e clique *Carregar minhas fichas*.
- **O site abre mas login não funciona no arquivo baixado**: use a URL HTTPS publicada no GitHub Pages.
- **Erro de tamanho da ficha**: reduza o tamanho das imagens ou use backup JSON offline.
- **Conflito de edições**: exporte a versão local em JSON; depois decida se quer carregar a versão mais recente da nuvem.

## Observação sobre direitos de publicação

O HTML contém material e referências visuais do OP RPG e de obras relacionadas a One Piece, provenientes das versões recebidas para uso na ficha. Antes de tornar o repositório e o site públicos, confirme a autorização para redistribuição dessas artes, descrições e trechos; o fato de o GitHub permitir publicação não concede licenças de uso.

## Referências oficiais

- Firebase Web: https://firebase.google.com/docs/web/setup
- Login por e-mail/senha: https://firebase.google.com/docs/auth/web/password-auth
- Login Google: https://firebase.google.com/docs/auth/web/google-signin
- Regras Firestore: https://firebase.google.com/docs/firestore/security/rules-conditions
- GitHub Pages: https://docs.github.com/en/pages

## Configuração pendente no seu Firebase

Este repositório **não** altera configurações do Firebase Console automaticamente. Ainda é necessário: (1) ativar Authentication por E-mail/Senha e Google; (2) criar o Firestore e publicar o conteúdo de `firestore.rules`; (3) adicionar `rnox1.github.io` aos domínios autorizados. No GitHub, ativar Pages a partir de `main` / raiz se ainda não estiver ativo.

**Limitação desta entrega:** a tentativa de gravar diretamente no repositório GitHub por integração retornou HTTP 403 (`Resource not accessible by integration`). Por isso, os arquivos ainda devem ser enviados manualmente ou a permissão de escrita da integração deve ser corrigida. O GitHub Pages também não foi ativado por esta integração.
