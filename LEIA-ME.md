# GrandLine RPG — GitHub Pages + Firebase · atualização v10

Projeto estático para o GitHub Pages. Não é necessário Node, Cloudflare ou servidor próprio.

## Instalação / atualização

1. **Antes de atualizar:** para sua tranquilidade, baixe um JSON do personagem atual, caso tenha alterações não sincronizadas.
2. Extraia o ZIP e **substitua os arquivos do repositório** (`index.html`, `firebase-client.js`, `firebase-config.js`, `firestore.rules`, `.nojekyll`). Não envie o ZIP sozinho.
3. Mantenha o GitHub Pages configurado para a branch `main`, pasta `/(root)`.
4. Firebase: o projeto `grandlinerpg` já está configurado em `firebase-config.js`. Mantenha Authentication E-mail/Senha e Google ativados, o domínio `rnox1.github.io` autorizado e publique as regras do `firestore.rules` em **Cloud Firestore → Regras**, não no Realtime Database.
5. A URL prevista é `https://rnox1.github.io/GrandLine/`. Depois do upload aguarde o deploy aparecer no GitHub Pages e atualize a página, se necessário com Ctrl+F5.

## Funcionamento v10

- **Salvamento automático:** quando a conta está logada, cada personagem local sem código é publicado individualmente no Firestore. Cada ficha recebe um código de 7 caracteres, como `abc-123`. As alterações são sincronizadas automaticamente após uma breve pausa de edição.
- **Código direto no cabeçalho:** clique no botão `☁ abc-123` para copiar o código da ficha atualmente selecionada. Use o botão discreto **Conta** para entrar, sair, abrir outro código, compartilhar e gerenciar editores autorizados.
- **Permissões:** o proprietário pode autorizar UIDs do Firebase, que poderão editar o original. O código sozinho permite consultar, mas não alterar a ficha. Não coloque dados privados em personagens publicados por código.
- **Cópia:** copiar gera um personagem independente, com novo ID local e, quando logado, novo código na nuvem. O original não é afetado.
- **JSON:** o botão **Backup** exporta exclusivamente o personagem que está aberto. O botão **Abrir** importa uma ficha, adicionando à lista e **mantendo todas as fichas anteriores**. Se você importar um backup antigo contendo `characters[]`, o site importa somente o personagem indicado por `selected`, ou o primeiro caso `selected` não esteja disponível.
- **Tela simplificada:** não há mais o caminho “Grand Line > Ficha” no topo, nem os botões duplicados de editar e dados. O botão **Editar personagem** permanece no banner da ficha. O botão de salvamento manual na nuvem foi substituído pela sincronização automática.

## Proteção dos dados

O navegador continua guardando a lista **local** dos personagens para uso offline. Isso é diferente do JSON: cada JSON contém apenas uma ficha. Na nuvem, cada documento `/characters/{codigo}` possui apenas um personagem e suas permissões específicas, não uma lista inteira.

Em caso de falha de rede, a alteração local é preservada. Em caso de edições concorrentes, a interface alerta sobre um conflito e oferece backup JSON antes da substituição. Se uma imagem tornar a ficha maior que o limite do Firestore, use uma imagem menor antes de sincronizar.

### Arquivos

- `index.html`: interface completa e catálogos do RPG.
- `firebase-client.js`: comunicação segura do navegador com Firebase Authentication e Cloud Firestore.
- `firebase-config.js`: configurações **públicas** do aplicativo; nunca coloque senhas, chaves privadas ou contas de serviço nele.
- `firestore.rules`: regras de autorização; publicar no Cloud Firestore Console.
- `.nojekyll`: publicação sem processamento Jekyll.

O pacote não configura automaticamente o Firebase Console. As regras Firestore existentes devem ser mantidas/publicadas manualmente se ainda não foram instaladas.
