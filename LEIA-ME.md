# GrandLine RPG — v12 • GitHub Pages + Firebase

## Alterações
- O banner **Diário de Bordo / Registro de Viagem** volta a exibir a **Alcunha** diretamente abaixo do nome do personagem. A alcunha não aparece duplicada na etiqueta inferior.
- Removido o campo de frase tanto da criação/edição simples quanto da edição detalhada.
- Removidos **Backup** e **Abrir** da barra superior. As funções foram preservadas, acessíveis em **Conta → Arquivos JSON**, incluindo backup individual e importação sem substituir os personagens já existentes.
- **Tripulação**, **Recompensa**, salvamento automático, login, compartilhamento e código clicável permanecem como na v11.

## Compatibilidade
Fichas existentes não precisam de migração. Dados antigos do campo `motto` são conservados nos backups para evitar perda, mas não aparecem mais na interface. Nenhuma alteração necessária nas regras Firestore.

## Publicar
Descompacte o ZIP e substitua o conteúdo na raiz do repositório GitHub Pages (principalmente `index.html`). Mantenha os arquivos `firebase-client.js`, `firebase-config.js`, `firestore.rules` e `.nojekyll` juntos. O site usa a configuração pública Firebase `grandlinerpg` existente no pacote. 

A integração GitHub Pages + Firebase continua exigindo autenticação ativa, Cloud Firestore configurado, regras publicadas e o domínio autorizado no Firebase.
