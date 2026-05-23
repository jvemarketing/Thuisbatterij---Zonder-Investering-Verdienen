/**
 * Route configuration.
 * Each entry maps a domain + path to a view template and its render data.
 * Add new sites/partners here — no other code needs touching.
 */
const routes = [
    // vastelastenonderzoek.nl
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/energiecrisis',
        view: 'vaste-lasten/pre-lander-energie-crisis',
        data: {},
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vaste-lasten-onderzoek',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
        },
    },
    //domain with typo
    {
        domain: 'vastenlastenonderzoek.nl',
        path: '/',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vaste-lasten-onderzoek',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/1',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vaste-lasten-onderzoek',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
            customPrizes: [
                { id: 'albert-heijn', name: 'Albert Heijn Cadeaukaart', shortName: 'Albert Heijn', val: '€500', img: '/vaste-lasten/img/albert-heijn-cadeaukaart.png' },
                { id: 'jumbo',        name: 'Jumbo Cadeaukaart',        shortName: 'Jumbo',        val: '€500', img: '/vaste-lasten/img/jumbo-cadeaukaart.png' },
                { id: 'lidl',         name: 'Lidl Cadeaukaart',         shortName: 'Lidl',         val: '€500', img: '/vaste-lasten/img/lidl-cadeaukaart.png' },
                { id: 'bol',          name: 'Bol.com Cadeaukaart',      shortName: 'Bol.com',      val: '€500', img: '/vaste-lasten/img/bol.com-cadeaukaart.png' },
                { id: 'vvv',          name: 'VVV Bon',                  shortName: 'VVV Bon',      val: '€500', img: '/vaste-lasten/img/vvv-cadeaukaart.png' },
                { id: 'action',       name: 'Action Cadeaukaart',       shortName: 'Action',       val: '€500', img: '/vaste-lasten/img/action-cadeaukaart.png' },
            ],
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/2',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vaste-lasten-onderzoek',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
            customPrizes: [
                { id: 'bijenkorf',   name: 'Bijenkorf Cadeaukaart',  shortName: 'Bijenkorf',   val: '€500', img: '/vaste-lasten/img/bijenkorf-cadeaukaart.png' },
                { id: 'zalando',     name: 'Zalando Cadeaukaart',    shortName: 'Zalando',     val: '€500', img: '/vaste-lasten/img/zalando-cadeaukaart.png' },
                { id: 'airpods',     name: 'Apple AirPods Pro',      shortName: 'AirPods Pro', val: '€279', img: '/vaste-lasten/img/apple-airpods-pro.png' },
                { id: 'apple-watch', name: 'Apple Watch',            shortName: 'Apple Watch', val: '€449', img: '/vaste-lasten/img/apple-watch.png' },
                { id: 'van-der-valk',name: 'Van der Valk Cadeaukaart',shortName: 'Van der Valk',val: '€500', img: '/vaste-lasten/img/van-der-valk-cadeaukaart.png' },
                { id: 'douglas',     name: 'Douglas Cadeaukaart',    shortName: 'Douglas',     val: '€500', img: '/vaste-lasten/img/douglas-cadeaukaart.png' },
            ],
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/voltafy',
        view: 'vaste-lasten/index',
        data: {
            partner: 'voltafy',
            logo: {
                src: '/vaste-lasten/img/voltafy.png',
                alt: 'Voltafy',
            },
            privacyURL: 'https://www.voltafy.nl/privacy-policy',
            termsURL: 'https://www.voltafy.nl/terms-conditions',
            faqURL: 'https://www.voltafy.nl/hoe-werkt-het',
            optOutURL: '#',
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/gemakkelijkbesparen',
        view: 'vaste-lasten/index',
        data: {
            partner: 'gemakkelijk-besparen',
            logo: {
                src: '/vaste-lasten/img/gemakkelijk-besparen.png',
                alt: 'Gemakkelijkbesparen',
            },
            privacyURL: 'https://www.gemakkelijkbesparen.nl/privacy-verklaring',
            termsURL: 'https://www.gemakkelijkbesparen.nl/algemene-voorwaarden',
            faqURL: '#',
            optOutURL: '#',
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/vle',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vle',
            logo: {
                src: '/vaste-lasten/img/vle.png',
                alt: 'Vle'
            },
            privacyURL: 'https://vastelastenexperts.nl/privacy-policy/',
            termsURL: 'https://vastelastenexperts.nl/algemene-voorwaarden/',
            faqURL: 'https://vastelastenexperts.nl/klantenservice/',
            optOutURL: 'https://vastelastenexperts.nl/toestemming-intrekken/',
        },
    },

    // verdienduurzaam.nl
    {
        domain: 'verdienduurzaam.nl',
        path: '/thuisbatterij-advies',
        view: 'thuisbatterij/pre-lander',
        data: {},
    },
    {
        domain: 'verdienduurzaam.nl',
        path: '/thuisbatterij',
        view: 'thuisbatterij/index',
        data: { clarityId: 'wlt8ml5f4e' },
    },
    {
        domain: 'verdienduurzaam.nl',
        path: '/thuisbatterij/flow',
        view: 'thuisbatterij/flow',
        data: { clarityId: 'wlt8ml5f4e' },
    },
    {
        domain: 'verdienduurzamer.nl',
        path: '/',
        view: 'thuisbatterij/index',
        data: { clarityId: 'wnwa4jr0p8' },
    },
    {
        domain: 'verdienduurzamer.nl',
        path: '/flow',
        view: 'thuisbatterij/flow',
        data: { clarityId: 'wnwa4jr0p8' },
    },
    {
        domain: 'verdienduurzamer.nl',
        path: '/thuisbatterij/flow',
        view: 'thuisbatterij/flow',
        data: { clarityId: 'wnwa4jr0p8' },
    },
];

export default routes;