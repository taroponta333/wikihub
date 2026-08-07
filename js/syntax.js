function syntaxHighlight(text){

text=text.replace(

/(\[\[.*?\]\])/g,

'<span class="syntax-link">$1</span>'

);

text=text.replace(

/(\{\{.*?\}\})/g,

'<span class="syntax-template">$1</span>'

);

text=text.replace(

/^(==.*==)$/gm,

'<span class="syntax-heading">$1</span>'

);

return text;

}
