import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Carregar .env manualmente
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialModules = [
    { title: 'Bem Vindo(a)', image: "/Capa-M%C3%B3dulo-1.jpeg" },
    { title: 'Avisos e Suporte', image: "https://images.unsplash.com/photo-1596524430615-b46476ddc820?q=80&w=1770&auto=format&fit=crop" },
    { title: 'Caminho Iluminado', image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1770&auto=format&fit=crop" },
    { title: 'Afiliado de Sucesso', image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" },
    { title: 'Como ser Produtor', image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1770&auto=format&fit=crop" },
    { title: 'Estrutura de Vendas', image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1770&auto=format&fit=crop" },
    { title: 'Marketing de Conteúdo', image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1770&auto=format&fit=crop" },
    { title: 'Como Fazer Copywriting', image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1771&auto=format&fit=crop" },
    { title: 'Como Subir Caixa Rápido', image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1771&auto=format&fit=crop" },
    { title: 'Tráfego Orgânico', image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" },
    { title: 'Tráfego Pago Facebook', image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1974&auto=format&fit=crop" },
    { title: 'Vendas com o WhatsApp', image: "https://images.unsplash.com/photo-1611746362936-43dd715292d4?q=80&w=2070&auto=format&fit=crop" },
    { title: 'Inteligência Artificial', image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop" },
    { title: 'Remarketing Estratégico', image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1776&auto=format&fit=crop" },
    { title: 'Pós-Venda Inteligente', image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" },
    { title: 'Obrigado', image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1784&auto=format&fit=crop" }
];

const initialBannerConfig = {
    desktopMediaType: 'image',
    desktopMediaUrl: "/Capa-principal-banner-1.jpeg",
    mobileMediaType: 'image',
    mobileMediaUrl: "",
    title: "",
    showTitle: false,
    description: "",
    showDescription: false,
    buttonText: "Saiba Mais",
    buttonLink: "#",
    showButton: false
};

async function runSeed() {
    console.log('🌱 Iniciando seed...');

    // Banner
    await setDoc(doc(db, 'app_settings', 'banner_config'), { value: initialBannerConfig });
    console.log('✅ Banner configurado');

    // Modules
    for (const [index, mod] of initialModules.entries()) {
        await addDoc(collection(db, 'modules'), {
            title: mod.title,
            image: mod.image,
            lessonCount: 0,
            showTitle: false,
            order_index: index
        });
        console.log(`  → Criado: ${mod.title}`);
    }

    console.log('✅ Banco de dados populado com sucesso!');
    process.exit(0);
}

runSeed().catch(err => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
});
