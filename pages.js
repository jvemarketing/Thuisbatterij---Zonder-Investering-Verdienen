const pages = [
    {
        name: 'vaste-lasten-onderzoek',
        domains: [
            { domain: 'vastelastenonderzoek.nl',  clarityId: 'wlt83wv5rj' },
            { domain: 'vastenlastenonderzoek.nl',  clarityId: 'xf1u2vo340' },
        ],
        defaultViewData: {
            partner: 'vaste-lasten-onderzoek',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
            freeLabel: null,
            vrijblijvendLabel: null,
            joinLabel: null,
            optOutLabel: null,
            hideParticipantStat: false,
            savingStatLabel: null,
            partnerFooter: null,
        },
        routes: [
            {
                path: '/',
                view: 'vaste-lasten/index',
                routeViewData: {},
            },
            {
                path: '/energiecrisis',
                view: 'vaste-lasten/pre-lander-energie-crisis',
                routeViewData: {},
            },
            {
                path: '/1',
                view: 'vaste-lasten/index',
                routeViewData: {
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
                path: '/2',
                view: 'vaste-lasten/index',
                routeViewData: {
                    customPrizes: [
                        { id: 'bijenkorf',    name: 'Bijenkorf Cadeaukaart',   shortName: 'Bijenkorf',   val: '€500', img: '/vaste-lasten/img/bijenkorf-cadeaukaart.png' },
                        { id: 'zalando',      name: 'Zalando Cadeaukaart',     shortName: 'Zalando',     val: '€500', img: '/vaste-lasten/img/zalando-cadeaukaart.png' },
                        { id: 'airpods',      name: 'Apple AirPods Pro',       shortName: 'AirPods Pro', val: '€279', img: '/vaste-lasten/img/apple-airpods-pro.png' },
                        { id: 'apple-watch',  name: 'Apple Watch',             shortName: 'Apple Watch', val: '€449', img: '/vaste-lasten/img/apple-watch.png' },
                        { id: 'van-der-valk', name: 'Van der Valk Cadeaukaart',shortName: 'Van der Valk',val: '€500', img: '/vaste-lasten/img/van-der-valk-cadeaukaart.png' },
                        { id: 'douglas',      name: 'Douglas Cadeaukaart',     shortName: 'Douglas',     val: '€500', img: '/vaste-lasten/img/douglas-cadeaukaart.png' },
                    ],
                },
            },
            {
                path: '/voltafy',
                view: 'vaste-lasten/index',
                routeViewData: {
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
                path: '/gemakkelijkbesparen',
                view: 'vaste-lasten/index',
                routeViewData: {
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
                path: '/vle',
                view: 'vaste-lasten/index',
                routeViewData: {
                    partner: 'vle',
                    logo: {
                        src: '/vaste-lasten/img/vle.png',
                        alt: 'Vle',
                    },
                    privacyURL: 'https://vastelastenexperts.nl/privacy-policy/',
                    termsURL: 'https://vastelastenexperts.nl/algemene-voorwaarden/',
                    faqURL: 'https://vastelastenexperts.nl/klantenservice/',
                    optOutURL: 'https://vastelastenexperts.nl/toestemming-intrekken/',
                    freeLabel: '100% vrijblijvend',
                    vrijblijvendLabel: '100% vrijblijvend advies',
                    joinLabel: 'vrijblijvend deelnemen',
                    optOutLabel: 'Toestemming intrekken',
                    hideParticipantStat: true,
                    savingStatLabel: 'Haal meer uit je energiebudget',
                    partnerFooter: 'In samenwerking met: Essent - EnergieDirect - Vattenfall - Engie - Greenchoice - Omnis Energy - NextEnergy',
                },
            },
        ],
    },
    {
        name: 'verdien-duurzaam',
        domains: [
            { domain: 'verdienduurzaam.nl',  clarityId: 'wlt8ml5f4e' },
            { domain: 'verdienduurzamer.nl', clarityId: 'wnwa4jr0p8' },
        ],
        defaultViewData: {},
        routes: [
            {
                path: '/',
                view: 'thuisbatterij/index',
                routeViewData: {},
            },
            {
                path: '/thuisbatterij',
                view: 'thuisbatterij/index',
                routeViewData: {},
            },
            {
                path: '/thuisbatterij-advies',
                view: 'thuisbatterij/pre-lander',
                routeViewData: {},
            },
            {
                path: '/flow',
                view: 'thuisbatterij/flow',
                routeViewData: {},
            },
            {
                path: '/thuisbatterij/flow',
                view: 'thuisbatterij/flow',
                routeViewData: {},
            },
        ],
    },
];

export default pages;