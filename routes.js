/**
 * Route configuration.
 * Each entry maps a domain + path to a view template and its render data.
 * Add new sites/partners here — no other code needs touching.
 */

const PARTNER_LOGOS = {
  'voltafy':             { src: '/vaste-lasten/img/Voltafy.png',             alt: 'Voltafy' },
  'gemakkelijk-besparen':{ src: '/vaste-lasten/img/Gemakkelijk-besparen.png', alt: 'Gemakkelijk Besparen' },
  'vle':                 { src: '/vaste-lasten/img/VLE.png',                  alt: 'Vaste Lasten Experts' },
};

const routes = [
  // vastenlastenonderzoek.nl
  {
    domain: 'vastenlastenonderzoek.nl',
    path: '/',
    view: 'vaste-lasten/index',
    data: { partner: null, partnerLogo: null },
  },
  {
    domain: 'vastenlastenonderzoek.nl',
    path: '/voltafy',
    view: 'vaste-lasten/index',
    data: { partner: 'voltafy', ...PARTNER_LOGOS['voltafy'] },
  },
  {
    domain: 'vastenlastenonderzoek.nl',
    path: '/gemakkelijkbesparen',
    view: 'vaste-lasten/index',
    data: { partner: 'gemakkelijk-besparen', ...PARTNER_LOGOS['gemakkelijk-besparen'] },
  },
  {
    domain: 'vastenlastenonderzoek.nl',
    path: '/vle',
    view: 'vaste-lasten/index',
    data: { partner: 'vle', ...PARTNER_LOGOS['vle'] },
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