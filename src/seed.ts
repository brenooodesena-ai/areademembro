import { db } from './lib/db';
import { initialModules, initialBannerConfig } from './lib/initialData';

export const seedDatabase = async () => {
    console.log('🌱 Iniciando seed do banco de dados...');

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
                // Ignorar erro de duplicata
                if (error.message && error.message.includes('duplicate')) {
                    console.log(`  ⚠️  Módulo "${mod.title}" já existe, pulando...`);
                } else {
                    console.error(`  ❌ Erro ao criar "${mod.title}":`, error.message);
                }
            }
        }

        console.log('✅ Seed concluído com sucesso!');
        console.log('🔄 Recarregue a página para ver os dados.');

        return { success: true };
    } catch (error: any) {
        console.error('❌ Erro durante seed:', error.message);

        if (error.message.includes('relation') || error.message.includes('does not exist')) {
            console.error('\n⚠️  ERRO: As tabelas não existem no banco de dados!');
            console.error('📋 AÇÃO NECESSÁRIA:');
            console.error('   1. Vá em: https://supabase.com/dashboard');
            console.error('   2. Abra seu projeto');
            console.error('   3. Vá em SQL Editor');
            console.error('   4. Cole o conteúdo do arquivo "supabase_schema.sql"');
            console.error('   5. Clique em RUN');
            console.error('   6. Depois rode novamente este script\n');
        }

        return { success: false, error };
    }
};

// Auto-executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}
