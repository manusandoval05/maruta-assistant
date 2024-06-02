// place files you want to import through the `$lib` alias in this folder.

export function convertMarkdownToHtml(markdownText: string) {
    // Convert headings
    markdownText = markdownText.replace(/^###### (.*?)$/gm, '<h6 class="h6 mb-3">$1</h6>');
    markdownText = markdownText.replace(/^##### (.*?)$/gm, '<h5 class="h5 mb-3">$1</h5>');
    markdownText = markdownText.replace(/^#### (.*?)$/gm, '<h4 class="h4 mb-3">$1</h4>');
    markdownText = markdownText.replace(/^### (.*?)$/gm, '<h3 class="h3 mb-3">$1</h3>');
    markdownText = markdownText.replace(/^## (.*?)$/gm, '<h class="h2 mb-3">$1</h2>');
    markdownText = markdownText.replace(/^# (.*?)$/gm, '<h1 class="h1 mb-3">$1</h1>');

    // Convert bold and italic text
    markdownText = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdownText = markdownText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert links
    markdownText = markdownText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Convert unordered lists
    markdownText = markdownText.replace(/^\s*\n\*/gm, '<ul>\n*');
    markdownText = markdownText.replace(/^(\* .*)/gm, '<li>$1</li>');
    markdownText = markdownText.replace(/<\/li>\s*\n<li>/g, '</li>\n<li>');
    markdownText = markdownText.replace(/<\/li>\n\n<\/ul>/g, '</li>\n</ul>');
    markdownText = markdownText.replace(/<\/li>\n\n<li>/g, '</li>\n<li>');
    markdownText = markdownText.replace(/<\/li>\n(\* .*)/gm, '</li>\n<ul>\n<li>$1</li>\n</ul>');
    markdownText = markdownText.replace(/<\/ul>\n\n<\/ul>/g, '</ul>\n</ul>');

    // Convert paragraphs
    markdownText = markdownText.replace(/\n\n/g, '</p><p>');
    markdownText = '<p class="mb-3">' + markdownText + '</p>';
    markdownText = markdownText.replace(/<\/p><p>/g, '</p>\n<p>');

    return markdownText;
}