/**
 * Route configuration.
 * Each entry maps a domain + path to a view template and its render data.
 * Add new sites/partners here — no other code needs touching.
 */
const routes = [
    // vastelastenonderzoek.nl
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
            termsURL: '/privacy.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
        },
    },
    {
        domain: 'vastelastenonderzoek.nl',
        path: '/voltafy',
        view: 'vaste-lasten/index',
        data: {
            partner: 'voltafy',
            logo: {
                src: '/vaste-lasten/img/Voltafy.png',
                alt: 'Voltafy',
            },
            privacyURL: 'https://www.voltafy.nl/privacy-policy',
            termsURL: 'https://www.voltafy.nl/terms-conditions',
            faqURL: '#',
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
                src: '/vaste-lasten/img/Gemakkelijk-besparen.png',
                alt: 'Voltafy',
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
                src: '/vaste-lasten/img/Vle.png',
                alt: 'Vle'
            },
            privacyURL: 'https://vastelastenexperts.nl/privacy-policy/',
            termsURL: 'https://vastelastenexperts.nl/algemene-voorwaarden/',
            faqURL: '#',
            optOutURL: 'https://vastelastenexperts.nl/toestemming-intrekken/',
        },
    },

    // verdienduurzaam.nl
    {
        domain: 'verdienduurzaam.nl',
        path: '/thuisbatterij',
        view: 'thuisbatterij/index',
        data: {},
    },
];

export default routes;