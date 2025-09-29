Central de Projetos - bundle

Arquivos:
- index.html
- style.css
- script.js

Instruções:
1. Descompacte o ZIP.
2. Abra index.html em um navegador moderno.
3. Para imagens locais (icons/*), você pode colocar arquivos em uma pasta 'icons' ao lado do index.html.
   - exemplo: icons/estacao.png, icons/todo.png, icons/subnautica.png, icons/user.png
4. O projeto usa localStorage para favoritos e contadores de acesso.
5. O loader global aparece até o evento 'load' do navegador.

Observações:
- Algumas checagens de status usam fetch com 'no-cors' (limitação do navegador). Para resultados reais, implemente uma rota server-side com CORS habilitado e retorne JSON.
- Para produção, recomendo compilar Tailwind localmente e minificar os assets.
