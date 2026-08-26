/**
 * Formata a resposta do Gemini em HTML limpo e amigável,
 * convertendo formatação markdown básica para tags HTML.
 */
export const formatMessage = (text) => {
    if (!text) return '';
    let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Negrito
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points
    const lines = escaped.split('\n');
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
            const content = trimmed.substring(1).trim();
            return `<li style="margin-left: 15px; margin-bottom: 4px;">${content}</li>`;
        }
        return line;
    });
    
    return formattedLines.join('<br />');
};
