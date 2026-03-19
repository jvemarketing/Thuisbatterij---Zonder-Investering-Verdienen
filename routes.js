/**
 * Route configuration.
 * Each entry maps a domain + path to a view template and its render data.
 * Add new sites/partners here — no other code needs touching.
 */
const routes = [
    // vastenlastenonderzoek.nl
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
        },
    },
    {
        domain: 'vastenlastenonderzoek.nl',
        path: '/voltafy',
        view: 'vaste-lasten/index',
        data: {
            partner: 'voltafy',
            logo: {
                src: '/vaste-lasten/img/Voltafy.png',
                alt: 'Voltafy',
            },
            termsURL: 'https://www.voltafy.nl/terms-conditions',
            privacyURL: 'https://www.voltafy.nl/privacy-policy',
        },
    },
    {
        domain: 'vastenlastenonderzoek.nl',
        path: '/gemakkelijkbesparen',
        view: 'vaste-lasten/index',
        data: {
            partner: 'gemakkelijk-besparen',
            logo: {
                termsURL: 'https://www.gemakkelijkbesparen.nl/algemene-voorwaarden',
                privacyURL: 'https://www.gemakkelijkbesparen.nl/privacy-verklaring',
            },
            termsURL: 'https://www.gemakkelijkbesparen.nl/algemene-voorwaarden',
            privacyURL: 'https://www.gemakkelijkbesparen.nl/privacy-verklaring',
        },
    },
    {
        domain: 'vastenlastenonderzoek.nl',
        path: '/vle',
        view: 'vaste-lasten/index',
        data: {
            partner: 'vle',
            logo: {
                src: '/vaste-lasten/img/Vle.png',
                alt: 'Vle'
            }
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