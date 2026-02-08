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


// Função para criar usuário administrador automaticamente
export const createAdminUser = async () => {
    const adminEmail = 'brenooodesena@gmail.com';
    const tempPassword = 'admin123';

    try {
        const passwordHash = await hashPassword(tempPassword);

        // Verificar se usuário existe
        const exists = await db.checkEmailExists(adminEmail);

        if (exists) {
            // Atualizar senha se já existir
            console.log('🔄 Atualizando senha do administrador no Firestore...');
            await db.updatePassword(adminEmail, passwordHash);
        } else {
            // Criar novo se não existir
            console.log('✨ Criando usuário administrador no Firestore...');
            await db.registerStudent('Administrador', adminEmail, passwordHash, 'approved');
        }
        console.log('✅ Acesso de administrador configurado: brenooodesena@gmail.com / admin123');
    } catch (error) {
        console.error('Erro ao configurar administrador no Firebase:', error);
    }
};
