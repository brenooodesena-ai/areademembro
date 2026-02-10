import { db } from './lib/db';
import { initialModules, initialBannerConfig } from './lib/initialData';
import { hashPassword } from './lib/auth';

export const seedDatabase = async () => {
    console.log('🌱 Iniciando seed do banco de dados (Firebase)...');

    try {
        // 1. Popular Banner
        console.log('📸 Configurando banner...');
        await db.saveBannerConfig(initialBannerConfig);
        console.log('✅ Banner configurado!');

        // 2. Popular Módulos
        console.log('📚 Criando módulos iniciais...');
        for (const mod of initialModules) {
            try {
                console.log(`  → Criando: ${mod.title}`);
                await db.createModule({
                    title: mod.title,
                    image: mod.image,
                    lessonCount: 0,
                    showTitle: false
                });
            } catch (error: any) {
                console.error(`  ❌ Erro ao criar "${mod.title}":`, error.message);
            }
        }

        console.log('✅ Seed concluído com sucesso!');
        console.log('🔄 Recarregue a página para ver os dados no Firestore.');

        return { success: true };
    } catch (error: any) {
        console.error('❌ Erro durante seed:', error.message);
        return { success: false, error };
    }
};


// Função para garantir que o usuário administrador exista (sem resetar senha)
export const createAdminUser = async () => {
    const adminEmail = 'brenooodesena@gmail.com'.toLowerCase();
    const tempPassword = 'admin123';

    try {
        // Verificar se usuário existe (usando a nova busca robusta)
        const existing = await db.getStudentByEmail(adminEmail);

        if (existing) {
            console.log(`[SEED] Admin já existe (ID: ${existing.id}). Nenhuma ação necessária.`);
        } else {
            console.log('[SEED] Admin não encontrado. Criando nova conta...');
            const passwordHash = await hashPassword(tempPassword);
            await db.registerStudent('Administrador', adminEmail, passwordHash, 'approved');
            console.log('[SEED] Acesso inicial configurado: brenooodesena@gmail.com / admin123');
        }
    } catch (error) {
        console.error('[SEED] Erro ao configurar admin:', error);
    }
};
