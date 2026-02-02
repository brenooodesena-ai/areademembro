// Simple password hashing utility (use bcrypt in production)
export const hashPassword = async (password: string): Promise<string> => {
    // IMPORTANTE: Em produção, use bcrypt ou a autenticação nativa do Supabase
    // Por simplicidade, vou usar uma hash básica
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'area-membros-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
};
