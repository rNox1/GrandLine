# GrandLine RPG — v11 • GitHub Pages + Firebase

## O que mudou
- No **Diário de Bordo**, a frase abaixo do nome agora é própria do personagem, independente da alcunha.
- O botão **✎ Editar personagem** do banner (ou a criação de uma ficha nova) mostra os campos **Frase do personagem**, **Tripulação** e **Recompensa (฿)** na primeira etapa.
- Os mesmos três dados também podem ser alterados em **Personagem → Edição completa**, aplicando as alterações pelo botão de confirmação.
- Ao salvar, os valores aparecem imediatamente no banner. A alcunha, quando preenchida, fica em uma etiqueta própria.
- A frase pode ter até 180 caracteres na edição simples. A tripulação pode ter até 100 caracteres.

## Compatibilidade
Nenhuma migração é necessária. Personagens antigos continuam funcionando; sem frase própria, o banner mostra "Uma história ainda por escrever". Os campos `crew` e `bounty` já existiam no modelo, mas não eram oferecidos no editor principal. O novo campo `motto` é salvo com a ficha individual (localStorage, JSON e Firestore).

## Atualizar o GitHub
Substitua os arquivos na **raiz** do repositório GitHub Pages (`index.html`, demais arquivos). O `firebase-config.js` já contém a configuração **pública** do projeto `grandlinerpg` que estava na v10. Não adicione senhas nem credenciais administrativas.

O projeto continua dependendo de Firebase Authentication (e-mail/senha e Google), do Cloud Firestore com as regras de `firestore.rules` publicadas no Console, e do domínio `rnox1.github.io` autorizado para login. O arquivo de regras não precisa ser alterado para esses campos.

A versão não foi enviada automaticamente ao GitHub: publique os arquivos extraídos do ZIP no repositório.
