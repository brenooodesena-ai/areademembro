/**
 * Utilitário para manipular e comprimir imagens no navegador
 */

export const compressImage = async (base64Str: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Redimensionar proporcionalmente se for maior que o máximo
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Não foi possível obter o contexto do Canvas'));
                return;
            }

            // Desenhar imagem no canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Exportar como JPEG comprimido
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

            // Log do tamanho para debug
            const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
            console.log(`🖼️ Imagem comprimida: ${width}x${height} | Tamanho: ${(sizeInBytes / 1024).toFixed(2)} KB`);

            resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
    });
};
