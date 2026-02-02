import { db } from './db';
import { initialModules, initialBannerConfig } from './initialData';

export const seedDatabase = async () => {
    console.log('🌱 Iniciando seed do banco de dados...');

    try {
        // 1. Popular Banner
        console.log('📸 Configurando banner...');
        await db.saveBannerConfig(initialBannerConfig);
        console.log('✅ Banner configurado!');

        // 2. Popular Módulos
        console.log('📚 Criando módulos iniciais...');
        let created = 0;

        for (const mod of initialModules) {
            try {
                console.log(`  → Criando: ${mod.title}`);
                await db.createModule({
                    title: mod.title,
                    image: mod.image,
                    lessonCount: 0,
                    showTitle: false
                });
                created++;
            } catch (error: any) {
                console.log(`  ⚠️ Erro ao criar "${mod.title}":`, error.message || error);
            }
        }

        console.log(`✅ Seed concluído! ${created}/${initialModules.length} módulos criados.`);
        console.log('🔄 Recarregue a página para ver os dados.');

        return { success: true, created };
    } catch (error: any) {
        console.error('❌ Erro durante seed:', error.message || error);
        return { success: false, error };
    }
};

// Expor globalmente para uso no console
if (typeof window !== 'undefined') {
    (window as any).seedDatabase = seedDatabase;
    console.log('💡 Você pode rodar "seedDatabase()" no console para popular o banco!');
}
