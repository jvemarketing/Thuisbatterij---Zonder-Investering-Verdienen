// Brand data shared between each brand's "/" and "/winactie" route for the
// "De Grote Bespaarcheck 2026" campaign (see the bespaarcheck-2026 page group
// below) — kept here instead of duplicated per-route.
const BESPAARCHECK_VLE_BRAND = {
    brandName: 'Vastelastenexperts',
    brandDomain: 'vastelastenexperts.nl',
    logo: '/bespaarcheck/img/vle-logo.png',
    actieSuffix: '',
    // Which brand config api/bespaarcheck-sms-send.js and
    // api/bespaarcheck-sms-verify.js should use (separate Twilio account
    // from the rest of the site, see those files).
    smsBrand: 'vle',
    paars: '#22123A',
    paarsMid: '#3B2570',
    groen: '#3DE260',
    groenDonker: '#12A344',
    groenRgb: '61,226,96',
    groenHoverBg: '#2ECC4F',
    bg: '#F4F2F9',
    grey: '#5C556E',
    line: '#E4E0EE',
    onGroen: 'var(--paars)',
    icBg: '#F1EDFB',
    heroSubColor: '#CDBFF5',
    heroMiniColor: '#B4A7CE',
};
const BESPAARCHECK_HOEKSTRA_BRAND = {
    brandName: 'Hoekstra Ondernemersadvies',
    brandDomain: 'hoekstraondernemersadvies.nl',
    logo: '/bespaarcheck/img/hoekstra-logo.png',
    actieSuffix: '-hoekstra',
    smsBrand: 'hoekstra',
    paars: '#24193E',
    paarsMid: '#3B316F',
    groen: '#38AA3C',
    groenDonker: '#2E8F33',
    groenRgb: '56,170,60',
    groenHoverBg: '#2E8F33',
    bg: '#F3F2F8',
    grey: '#4A4458',
    line: '#E5E2F0',
    onGroen: '#ffffff',
    icBg: '#EFECF7',
    heroSubColor: '#CFC9E8',
    heroMiniColor: '#B4ADCB',
};

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
            advisorName: null,
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
                path: '/cashback1',
                view: 'vaste-lasten/pre-lander-cashback',
                routeViewData: {
                    giftImage: '/vaste-lasten/img/cashback-gifts-1.png',
                    flowURL: '/?start',
                },
            },
            {
                path: '/cashback2',
                view: 'vaste-lasten/pre-lander-cashback',
                routeViewData: {
                    giftImage: '/vaste-lasten/img/cashback-gifts-2.png',
                    flowURL: '/1?start',
                },
            },
            {
                path: '/cashback3',
                view: 'vaste-lasten/pre-lander-cashback',
                routeViewData: {
                    giftImage: '/vaste-lasten/img/cashback-gifts-3.png',
                    flowURL: '/2?start',
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
                // Clone of /vle rebranded as "Wij Vergelijken" — Asana task 1219246685521505.
                path: '/wij-vergelijken',
                view: 'vaste-lasten/index',
                routeViewData: {
                    partner: 'wij-vergelijken',
                    partnerName: 'Wij Vergelijken',
                    logo: {
                        src: '/vaste-lasten/img/wij-vergelijken.png',
                        alt: 'Wij Vergelijken',
                    },
                    privacyURL: 'https://wij-vergelijken.nl/privacy-policy/',
                    termsURL: 'https://wij-vergelijken.nl/algemene-voorwaarden/',
                    optOutURL: 'https://wij-vergelijken.nl/toestemming-intrekken/',
                    freeLabel: '100% vrijblijvend',
                    vrijblijvendLabel: '100% vrijblijvend advies',
                    joinLabel: 'vrijblijvend deelnemen',
                    optOutLabel: 'Toestemming intrekken',
                    hideStatsBand: true,
                    consentCheckbox: true,
                    partnerFooter: 'In samenwerking met: Essent - EnergieDirect - Engie - Greenchoice - Omnis Energy - NextEnergy',
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
                    // Footer links to Ebned's own privacy/terms/opt-out pages.
                    privacyURL: 'https://ebned.nl/privacy',
                    termsURL: 'https://ebned.nl/voorwaarden',
                    optOutURL: 'https://ebned.nl/privacyvoorkeuren',
                    actievoorwaardenURL: '/ebned/actievoorwaarden-vastelastenonderzoek.html',
                    advisorName: 'EBNed',
                    consentText: 'Door op "Ga Verder" te klikken geeft u toestemming dat Ebned B.V. telefonisch contact met u opneemt voor een gratis en vrijblijvende bespaarcheck van uw energie- en telecomkosten. Hiervoor worden uw contactgegevens gedeeld met Ebned B.V., die deze verwerkt overeenkomstig haar privacyverklaring. U kunt uw toestemming op ieder moment intrekken via de <a href="/ebned/opt-out.html" target="_blank">afmeldmogelijkheid van Ebned</a> of door contact op te nemen met Ebned. Lees ook de <a href="https://ebned.nl/privacy" target="_blank">Privacyverklaring</a> en <a href="https://ebned.nl/voorwaarden" target="_blank">Algemene Voorwaarden</a> van Ebned.',
                    // Databowl campaign id for "NL - VLO - EBNED - Energie"; sub-id inherits
                    // the same default used by the other Vaste Lasten Onderzoek routes.
                    databowlCid: '1420',
                },
            },
            {
                // Preview of a new 12-question flow for the EBNED partner page —
                // same partner branding/consent/Databowl campaign as /ebned, only
                // the question set differs (view: vaste-lasten/ebned-new-flow).
                path: '/ebned-new-flow',
                view: 'vaste-lasten/ebned-new-flow',
                routeViewData: {
                    partner: 'ebned',
                    partnerName: 'Ebned',
                    logo: {
                        src: '/vaste-lasten/img/ebned.png',
                        alt: 'Ebned',
                    },
                    // Footer links to Ebned's own privacy/terms/opt-out pages.
                    privacyURL: 'https://ebned.nl/privacy',
                    termsURL: 'https://ebned.nl/voorwaarden',
                    optOutURL: 'https://ebned.nl/privacyvoorkeuren',
                    actievoorwaardenURL: '/ebned/actievoorwaarden-vastelastenonderzoek.html',
                    advisorName: 'EBNed',
                    consentText: 'Door op "Ga Verder" te klikken geeft u toestemming dat Ebned B.V. telefonisch contact met u opneemt voor een gratis en vrijblijvende bespaarcheck van uw energie- en telecomkosten. Hiervoor worden uw contactgegevens gedeeld met Ebned B.V., die deze verwerkt overeenkomstig haar privacyverklaring. U kunt uw toestemming op ieder moment intrekken via de <a href="/ebned/opt-out.html" target="_blank">afmeldmogelijkheid van Ebned</a> of door contact op te nemen met Ebned. Lees ook de <a href="https://ebned.nl/privacy" target="_blank">Privacyverklaring</a> en <a href="https://ebned.nl/voorwaarden" target="_blank">Algemene Voorwaarden</a> van Ebned.',
                    databowlCid: '1420',
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
                    companyEmail: 'privacy@ebned.nl',
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
                        src: '/vaste-lasten/img/ebned.png',
                        alt: 'Ebned',
                    },
                    // EBNed B.V. is the sole legal organizer of this prize draw per the
                    // updated spelvoorwaarden (Asana task 1217814462344882).
                    companyName: 'EBNed B.V.',
                    companyAddress: 'Bogert 31, 5612 LX Eindhoven',
                    companyKvk: '95569111',
                    companyEmail: 'klachten@ebned.nl',
                    privacyURL: 'https://ebned.nl/privacy',
                    optOutURL: 'https://ebned.nl/privacyvoorkeuren',
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
                path: '/thuisbatterij-verdienen',
                view: 'thuisbatterij/pre-lander-verdienen',
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
            {
                path: '/isolatie',
                view: 'isolatie/index',
                routeViewData: {
                    clarityId: { 'verdienduurzaam.nl': 'yqcqk5h2q0' },
                    slug: '/',
                    measure: 'Isolatiecheck',
                    headlineDark: 'De gasprijs is dit jaar verdrievoudigd.',
                    headlineGreen: '\nStop met te veel betalen, isoleer je woning',
                    sub: 'Een slecht geïsoleerd huis verliest warmte via het dak, de vloer en de muren. Die warmte betaal je nu tegen de hoogste prijs in jaren. Isoleer voor de winter en ontvang tot €4.500 subsidie.',
                    saving: '€900',
                    formTitle: 'Isolatie en Subsidie aanvraag',
                    formSub: 'Ontdek hoeveel je kunt besparen op je energiekosten en welke subsidies er voor jou beschikbaar zijn.',
                    flowTotalSteps: 8,
                    benefitsImage: 'isolatie-benefits.jpg',
                    benefitsTitle: 'Wat levert isoleren je op?',
                    benefits: [
                        {
                            icon: 'coins',
                            title: 'Tot €4500 subsidie op je investering',
                            text: 'Je krijgt een vast subsidiebedrag per m² van de kosten voor isolatie terug. Laat je binnen 24 maanden twee soorten isolatie uitvoeren? Dan stijgt het subsidiebedrag per m² voor beide. Zo krijg je meer van je isolatiekosten vergoed.',
                        },
                        {
                            icon: 'fire',
                            title: 'Lagere energierekening',
                            text: 'Minder warmteverlies betekent minder stoken en dus een lagere energierekening.',
                        },
                        {
                            icon: 'couch',
                            title: 'Comfort in het hele huis',
                            text: 'In de winter geen koude vloer en kille muren. In de zomer blijft de hitte juist buiten in plaats van binnen.',
                        },
                    ],
                    compareBeforeTitle: 'Ongeïsoleerde woning',
                    compareBeforeText: 'In de winter verdwijnt je warmte via het dak, de vloer en de muren. In de zomer werkt het andersom: de hitte komt er net zo makkelijk in. Slaapkamers boven de dertig graden, en een zolder waar je niet kunt zijn.',
                    compareAfterTitle: 'Geïsoleerde woning',
                    compareAfterText: 'In de winter blijft de warmte binnen. In de zomer blijft de hitte buiten. Zo is je huis het hele jaar door aangenamer en op een constante temperatuur.',
                    fundsTitle: 'Subsidie en het Warmtefonds uitgelegd',
                    fundsIntro: 'Isoleren is een investering, maar je hoeft niet alles zelf te betalen. Er zijn meerdere regelingen die de kosten flink verlagen. Bekijk welke voor jou openstaan.',
                    funds: [
                        {
                            title: 'ISDE — landelijke isolatiesubsidie',
                            text: 'De ISDE is de landelijke subsidie voor isolatie. Je krijgt een vast bedrag per vierkante meter, tot wel €4.500 per woning. Je vraagt de subsidie aan ná de uitvoering, via RVO. Zo krijg je een flink deel van je investering terug.',
                        },
                        {
                            title: 'Gemeentelijke regelingen',
                            text: 'Veel gemeenten hebben naast de ISDE een eigen isolatiesubsidie of een lening met lage rente. Wat er in jouw gemeente openstaat, hangt af van je postcode — de check laat het direct zien.',
                        },
                        {
                            title: 'Warmtefonds',
                            text: 'Wil je niet alles vooraf betalen? Via het Nationaal Warmtefonds leen je tegen lage rente voor isolatie. Je vraagt het zelf aan, niet via je gemeente. Je rente hangt af van je inkomen. Bij een laag inkomen betaal je minder.',
                        },
                        {
                            title: 'Direct lagere energierekening',
                            text: 'Isolatie verlaagt je verbruik vanaf dag één. Dat zie je elke maand terug op je energierekening. Met energieprijzen die jaarlijks stijgen, verdient isolatie zich steeds sneller terug.',
                        },
                    ],
                    seo: {
                        title: 'Isolatie subsidie 2026 — doe de gratis isolatiecheck | VerdienDuurzaam',
                        description: 'Ontdek welke isolatie en welke subsidie bij jouw woning passen. Landelijke ISDE en gemeentelijke isolatiesubsidie, gecheckt op postcode. Gratis in 45 seconden.',
                    },
                },
            },
            {
                path: '/dakisolatie',
                view: 'isolatie/index',
                routeViewData: {
                    clarityId: { 'verdienduurzaam.nl': 'yqcruvsqds' },
                    slug: '/dakisolatie',
                    measure: 'Dakisolatie',
                    headlineDark: 'Ben jij klaar om te veel voor je energie te betalen deze winter?',
                    headlineGreen: 'Dakisolatie verlaagt je rekening direct',
                    sub: 'Energieprijzen blijven stijgen. Een slecht of verouderd geïsoleerd dak zorgt voor onnodig warmteverlies en een hogere rekening. Met dakisolatie houd je warmte in de winter binnen en je woning in de zomer koeler. Regel je dakisolatie en krijg tot wel €4.500 aan subsidie terug. Het budget voor 2026 is beperkt en op=op.',
                    saving: '€600',
                    formTitle: 'Isolatie en Subsidie aanvraag',
                    formSub: 'Ontdek hoeveel je kunt besparen op je energiekosten en welke subsidies er voor jou beschikbaar zijn.',
                    flowTotalSteps: 8,
                    benefitsImage: 'dakisolatie-benefits.jpg',
                    benefitsTitle: 'Wat levert dakisolatie je op?',
                    benefits: [
                        {
                            icon: 'coins',
                            title: 'Subsidie op je investering',
                            text: 'Voor dakisolatie geldt een landelijk bedrag per m². Veel gemeenten leggen daar een eigen regeling bovenop.',
                        },
                        {
                            icon: 'fire',
                            title: 'Lagere energierekening',
                            text: 'Je verliest minder warmte, dus je verwarming hoeft minder hard te werken.',
                        },
                        {
                            icon: 'couch',
                            title: 'Comfort boven',
                            text: 'Slaapkamers en zolder houden een stabielere temperatuur — winter én zomer.',
                        },
                    ],
                    compareBeforeTitle: 'Zonder dakisolatie',
                    compareBeforeText: 'Warme lucht stijgt naar de zolder en verdwijnt door het dak. Je stookt door, de bovenverdieping blijft koud en in de zomer wordt de zolder snel te warm.',
                    compareAfterTitle: 'Met dakisolatie',
                    compareAfterText: 'De warmte blijft binnen waar je hem nodig hebt. De bovenverdieping warmt sneller op, blijft langer warm en de zolder koelt in de zomer minder snel door.',
                    fundsTitle: 'Subsidie en het Warmtefonds uitgelegd',
                    fundsIntro: 'Isoleren is een investering, maar je hoeft niet alles zelf te betalen. Er zijn meerdere regelingen die de kosten flink verlagen. Bekijk welke voor jou openstaan.',
                    funds: [
                        {
                            title: 'ISDE — landelijke isolatiesubsidie',
                            text: 'De ISDE is de landelijke subsidie voor isolatie. Je krijgt een vast bedrag per vierkante meter, tot wel €4.500 per woning. Je vraagt de subsidie aan ná de uitvoering, via RVO. Zo krijg je een flink deel van je investering terug.',
                        },
                        {
                            title: 'Gemeentelijke regelingen',
                            text: 'Veel gemeenten hebben naast de ISDE een eigen isolatiesubsidie of een lening met lage rente. Wat er in jouw gemeente openstaat, hangt af van je postcode — de check laat het direct zien.',
                        },
                        {
                            title: 'Warmtefonds',
                            text: 'Wil je niet alles vooraf betalen? Via het Nationaal Warmtefonds leen je tegen lage rente voor isolatie. Je vraagt het zelf aan, niet via je gemeente. Je rente hangt af van je inkomen. Bij een laag inkomen betaal je minder.',
                        },
                        {
                            title: 'Direct lagere energierekening',
                            text: 'Isolatie verlaagt je verbruik vanaf dag één. Dat zie je elke maand terug op je energierekening. Met energieprijzen die jaarlijks stijgen, verdient isolatie zich steeds sneller terug.',
                        },
                    ],
                    seo: {
                        title: 'Dakisolatie subsidie 2026 — check je regeling | VerdienDuurzaam',
                        description: 'Check welke subsidie voor dakisolatie in 2026 voor jouw woning geldt: landelijke ISDE en gemeentelijke regelingen. Gratis isolatiecheck in 45 seconden.',
                    },
                },
            },
            {
                path: '/vloerisolatie',
                view: 'isolatie/index',
                routeViewData: {
                    clarityId: { 'verdienduurzaam.nl': 'yqcsl8wf46' },
                    slug: '/vloerisolatie',
                    measure: 'Vloerisolatie',
                    headlineDark: 'Ben jij klaar om te veel voor je energie te betalen deze winter?',
                    headlineGreen: 'Vloerisolatie stopt het warmteverlies',
                    sub: 'Energieprijzen blijven stijgen. Een onvoldoende geïsoleerde vloer zorgt voor onnodig warmteverlies. Met vloerisolatie houd je warmte beter binnen, verhoog je je comfort en verlaag je direct je energierekening. Regel je vloerisolatie en krijg tot wel €4.500 aan subsidie terug. Het budget voor 2026 is beperkt en op=op.',
                    saving: '€350',
                    formTitle: 'Isolatie en Subsidie aanvraag',
                    formSub: 'Ontdek hoeveel je kunt besparen op je energiekosten en welke subsidies er voor jou beschikbaar zijn.',
                    flowTotalSteps: 8,
                    benefitsImage: 'vloerisolatie-benefits.jpg',
                    benefitsTitle: 'Wat levert vloerisolatie je op?',
                    benefits: [
                        {
                            icon: 'coins',
                            title: 'Subsidie op je investering',
                            text: 'Voor vloer- en bodemisolatie geldt een landelijk bedrag per m². Gemeenten hebben vaak een eigen aanvulling.',
                        },
                        {
                            icon: 'couch',
                            title: 'Direct meer comfort',
                            text: 'Het verschil in de woonkamer voel je meestal binnen een dag na uitvoering.',
                        },
                        {
                            icon: 'fire',
                            title: 'Lagere energierekening',
                            text: 'Minder warmteverlies onderin betekent minder stoken voor dezelfde temperatuur.',
                        },
                    ],
                    compareBeforeTitle: 'Zonder vloerisolatie',
                    compareBeforeText: 'Koude lucht uit de kruipruimte trekt door de vloer. De vloer voelt koud aan, je zet de verwarming hoger en het blijft tochten langs de plinten.',
                    compareAfterTitle: 'Met vloerisolatie',
                    compareAfterText: 'De kou uit de kruipruimte wordt tegengehouden. Hierdoor voelt de vloer merkbaar warmer en je woning houdt de warmte beter vast.',
                    fundsTitle: 'Subsidie en het Warmtefonds uitgelegd',
                    fundsIntro: 'Isoleren is een investering, maar je hoeft niet alles zelf te betalen. Er zijn meerdere regelingen die de kosten flink verlagen. Bekijk welke voor jou openstaan.',
                    funds: [
                        {
                            title: 'ISDE — landelijke isolatiesubsidie',
                            text: 'De ISDE is de landelijke subsidie voor isolatie. Je krijgt een vast bedrag per vierkante meter, tot wel €4.500 per woning. Je vraagt de subsidie aan ná de uitvoering, via RVO. Zo krijg je een flink deel van je investering terug.',
                        },
                        {
                            title: 'Gemeentelijke regelingen',
                            text: 'Veel gemeenten hebben naast de ISDE een eigen isolatiesubsidie of een lening met lage rente. Wat er in jouw gemeente openstaat, hangt af van je postcode — de check laat het direct zien.',
                        },
                        {
                            title: 'Warmtefonds',
                            text: 'Wil je niet alles vooraf betalen? Via het Nationaal Warmtefonds leen je tegen lage rente voor isolatie. Je vraagt het zelf aan, niet via je gemeente. Je rente hangt af van je inkomen. Bij een laag inkomen betaal je minder.',
                        },
                        {
                            title: 'Direct lagere energierekening',
                            text: 'Isolatie verlaagt je verbruik vanaf dag één. Dat zie je elke maand terug op je energierekening. Met energieprijzen die jaarlijks stijgen, verdient isolatie zich steeds sneller terug.',
                        },
                    ],
                    seo: {
                        title: 'Vloerisolatie subsidie 2026 — doe de check | VerdienDuurzaam',
                        description: 'Ontdek welke subsidie voor vloerisolatie in 2026 voor jouw woning geldt: landelijke ISDE plus gemeentelijke regelingen. Gratis check, inclusief kruipruimte-check.',
                    },
                },
            },
            {
                path: '/muurisolatie',
                view: 'isolatie/index',
                routeViewData: {
                    clarityId: { 'verdienduurzaam.nl': 'yqct9l1w4g' },
                    slug: '/muurisolatie',
                    measure: 'Muurisolatie',
                    headlineDark: 'Ben jij klaar om te veel voor je energie te betalen deze winter?',
                    headlineGreen: 'Muurisolatie verlaagt je kosten direct',
                    sub: 'Energieprijzen blijven stijgen. Via koude, ongeïsoleerde muren gaat er veel warmte verloren. Met spouwmuurisolatie houd je warmte binnen, je woning wordt comfortabeler en je verlaagt direct je energierekening. Regel je muurisolatie en krijg tot wel €4.500 aan subsidie terug. Het budget voor 2026 is beperkt en op=op.',
                    saving: '€1220',
                    formTitle: 'Isolatie en Subsidie aanvraag',
                    formSub: 'Ontdek hoeveel je kunt besparen op je energiekosten en welke subsidies er voor jou beschikbaar zijn.',
                    flowTotalSteps: 8,
                    benefitsImage: 'muurisolatie-benefits.jpg',
                    benefitsTitle: 'Wat levert muurisolatie je op?',
                    benefits: [
                        {
                            icon: 'coins',
                            title: 'Subsidie op je investering',
                            text: 'Voor gevel- en spouwmuurisolatie geldt een landelijk bedrag per m², plus vaak een gemeentelijke aanvulling.',
                        },
                        {
                            icon: 'fire',
                            title: 'Lagere energierekening',
                            text: 'Buitenmuren zijn een groot oppervlak. Minder verlies daar telt direct door in je verbruik.',
                        },
                        {
                            icon: 'wind',
                            title: 'Minder tocht en koude wanden',
                            text: 'Je hoeft niet langer met de bank van de buitenmuur af te schuiven.',
                        },
                    ],
                    compareBeforeTitle: 'Zonder muurisolatie',
                    compareBeforeText: 'De buitenmuren nemen de warmte op en geven die naar buiten af. De warmte \'lekt\' naar buiten toe en je huis voelt kouder aan.\nIn de zomer warmt de woning snel op omdat de muren veel hitte naar binnen laten van buiten af.',
                    compareAfterTitle: 'Met muurisolatie',
                    compareAfterText: 'De spouw in de muren houdt de warmte binnen in je huis.\nWanden voelen warmer aan en de temperatuur in huis blijft stabiel. daarbij wordt ook het geluid van buiten gedempt.',
                    fundsTitle: 'Subsidie en het Warmtefonds uitgelegd',
                    fundsIntro: 'Isoleren is een investering, maar je hoeft niet alles zelf te betalen. Er zijn meerdere regelingen die de kosten flink verlagen. Bekijk welke voor jou openstaan.',
                    funds: [
                        {
                            title: 'ISDE — landelijke isolatiesubsidie',
                            text: 'De ISDE is de landelijke subsidie voor isolatie. Je krijgt een vast bedrag per vierkante meter, tot wel €4.500 per woning. Je vraagt de subsidie aan ná de uitvoering, via RVO. Zo krijg je een flink deel van je investering terug.',
                        },
                        {
                            title: 'Gemeentelijke regelingen',
                            text: 'Veel gemeenten hebben naast de ISDE een eigen isolatiesubsidie of een lening met lage rente. Wat er in jouw gemeente openstaat, hangt af van je postcode — de check laat het direct zien.',
                        },
                        {
                            title: 'Warmtefonds',
                            text: 'Wil je niet alles vooraf betalen? Via het Nationaal Warmtefonds leen je tegen lage rente voor isolatie. Je vraagt het zelf aan, niet via je gemeente. Je rente hangt af van je inkomen. Bij een laag inkomen betaal je minder.',
                        },
                        {
                            title: 'Direct lagere energierekening',
                            text: 'Isolatie verlaagt je verbruik vanaf dag één. Dat zie je elke maand terug op je energierekening. Met energieprijzen die jaarlijks stijgen, verdient isolatie zich steeds sneller terug.',
                        },
                    ],
                    seo: {
                        title: 'Muurisolatie subsidie 2026 — check je regeling | VerdienDuurzaam',
                        description: 'Check welke subsidie voor muurisolatie en spouwmuurisolatie in 2026 voor jouw woning geldt. Landelijke ISDE plus gemeentelijke regelingen. Gratis check.',
                    },
                },
            },
        ],
    },
    {
        name: 'bespaarcheck-2026',
        domains: [
            { domain: 'de-grote-bespaarcheck.nl', clarityId: '' },
        ],
        defaultViewData: {},
        routes: [
            {
                path: '/vle',
                view: 'bespaarcheck/index',
                routeViewData: { ...BESPAARCHECK_VLE_BRAND, winactie: false },
            },
            {
                path: '/vle/winactie',
                view: 'bespaarcheck/index',
                routeViewData: { ...BESPAARCHECK_VLE_BRAND, winactie: true },
            },
            {
                path: '/hoekstra',
                view: 'bespaarcheck/index',
                routeViewData: { ...BESPAARCHECK_HOEKSTRA_BRAND, winactie: false },
            },
            {
                path: '/hoekstra/winactie',
                view: 'bespaarcheck/index',
                routeViewData: { ...BESPAARCHECK_HOEKSTRA_BRAND, winactie: true },
            },
        ],
    },
];

export default pages;