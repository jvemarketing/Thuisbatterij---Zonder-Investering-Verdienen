const pages = [
    {
        name: 'vaste-lasten-onderzoek',
        domains: [
            { domain: 'vastelastenonderzoek.nl',  clarityId: 'wlt83wv5rj' },
            { domain: 'vastenlastenonderzoek.nl',  clarityId: 'xf1u2vo340' },
        ],
        defaultViewData: {
            partner: 'vaste-lasten-onderzoek',
            partnerName: 'Vastelastenexperts',
            logo: {
                src: '/vaste-lasten/img/no-logo.png',
                alt: 'Vaste lasten onderzoek',
            },
            privacyURL: '/privacy.html',
            termsURL: '/terms.html',
            faqURL: '/faq.html',
            optOutURL: '/opt-out.html',
            actievoorwaardenURL: null,
            consentText: null,
            freeLabel: null,
            vrijblijvendLabel: null,
            joinLabel: null,
            optOutLabel: null,
            hideStatsBand: false,
            consentCheckbox: false,
            partnerFooter: null,
            databowlCid: '925',
            databowlSid: '34',
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
                    partnerName: 'Voltafy',
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
                    partnerName: 'Gemakkelijk Besparen',
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
                    hideStatsBand: true,
                    consentCheckbox: true,
                    partnerFooter: 'In samenwerking met: Essent - EnergieDirect - Vattenfall - Engie - Greenchoice - Omnis Energy - NextEnergy',
                },
            },
            {
                path: '/ebned',
                view: 'vaste-lasten/index',
                routeViewData: {
                    partner: 'ebned',
                    partnerName: 'Ebned',
                    logo: {
                        src: '/vaste-lasten/img/ebned.png',
                        alt: 'Ebned',
                    },
                    // Footer stays on JVE Marketing's own privacy/terms (page defaults) —
                    // only the opt-in consent block below links to Ebned's own policies.
                    optOutURL: '/ebned/opt-out.html',
                    actievoorwaardenURL: '/ebned/actievoorwaarden-vastelastenonderzoek.html',
                    consentText: 'Door op "Ga Verder" te klikken geeft u toestemming dat Ebned B.V. telefonisch contact met u opneemt voor een gratis en vrijblijvende bespaarcheck van uw energie- en telecomkosten. Hiervoor worden uw contactgegevens gedeeld met Ebned B.V., die deze verwerkt overeenkomstig haar privacyverklaring. U kunt uw toestemming op ieder moment intrekken via de <a href="/ebned/opt-out.html" target="_blank">afmeldmogelijkheid van Ebned</a> of door contact op te nemen met Ebned. Lees ook de <a href="https://ebned.nl/privacy" target="_blank">Privacyverklaring</a> en <a href="https://ebned.nl/voorwaarden" target="_blank">Algemene Voorwaarden</a> van Ebned.',
                    // PLACEHOLDER — replace with the real Databowl campaign id/sub-id for
                    // "NL - VLO - EBNED - Energie" once that campaign exists in Databowl.
                    databowlCid: 'TBD_EBNED_CID',
                    databowlSid: 'TBD_EBNED_SID',
                },
            },
            {
                path: '/ebned/opt-out.html',
                view: 'vaste-lasten/opt-out',
                routeViewData: {
                    logo: {
                        src: '/vaste-lasten/img/ebned-logo.png',
                        alt: 'Ebned',
                    },
                    // PLACEHOLDER — replace with Ebned's real contact email.
                    companyEmail: '[EBNED CONTACT E-MAIL]',
                    accentColor: '#c6f28b',
                    accentColorHover: '#b3e56a',
                    accentTextColor: '#0C1324',
                },
            },
            {
                path: '/ebned/actievoorwaarden-vastelastenonderzoek.html',
                view: 'vaste-lasten/actievoorwaarden',
                routeViewData: {
                    logo: {
                        src: '/vaste-lasten/img/ebned-logo.png',
                        alt: 'Ebned',
                    },
                    // JVE Marketing B.V. is the legal organizer of the prize draw; Ebned B.V.
                    // is named within the copy as the co-organizing partner (see actievoorwaarden.ejs).
                    companyName: 'JVE Marketing B.V.',
                    companyAddress: 'Keizersgracht 482, 1017 EG Amsterdam',
                    companyKvk: '98130137',
                    companyEmail: 'dpo@jvemarketing.com',
                    privacyURL: '/privacy.html',
                    optOutURL: '/ebned/opt-out.html',
                    faqURL: '/faq.html',
                    accentColor: '#c6f28b',
                    accentTextColor: '#0C1324',
                    accentTint: '#eef9dc',
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