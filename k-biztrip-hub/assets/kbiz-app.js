(function () {
  'use strict';

  const LS = (k, v) => {
    try {
      return v === undefined
        ? JSON.parse(localStorage.getItem(k) || 'null')
        : localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      return null;
    }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  const pin4 = (p) => /^\d{4}$/.test(String(p || '').trim());
  const isAdmin = () => LS('kbiz_admin') === true;

  const CAT_LABELS = {
    transport: '🚗 현지 차량·기사·통역',
    stay: '🏨 공단·출장지 숙소·맛집',
    visa: '🛂 비자·세관·입국 팁',
    biz: '💼 현지 비즈니스·파트너',
    qna: '💬 자유 질문·소통'
  };

  const COUNTRY_NAMES = {
    ID: '🇮🇩 인도네시아',
    VN: '🇻🇳 베트남',
    PH: '🇵🇭 필리핀',
    TH: '🇹🇭 태국',
    MY: '🇲🇾 말레이시아',
    SG: '🇸🇬 싱가포르',
    KH: '🇰🇭 캄보디아',
    JP: '🇯🇵 일본',
    CN: '🇨🇳 중국',
    TW: '🇹🇼 대만',
    HK: '🇭🇰 홍콩',
    US: '🇺🇸 미국',
    CA: '🇨🇦 캐나다',
    MX: '🇲🇽 멕시코',
    BR: '🇧🇷 브라질',
    DE: '🇩🇪 독일',
    GB: '🇬🇧 영국',
    FR: '🇫🇷 프랑스',
    PL: '🇵🇱 폴란드',
    HU: '🇭🇺 헝가리',
    CZ: '🇨🇿 체코',
    AT: '🇦🇹 오스트리아',
    ES: '🇪🇸 스페인·네덜란드',
    IN: '🇮🇳 인도',
    SA: '🇸🇦 사우디아라비아',
    AE: '🇦🇪 UAE(두바이)',
    UZ: '🇺🇿 우즈베키스탄',
    KZ: '🇰🇿 카자흐스탄',
    AU: '🇦🇺 호주',
    NZ: '🇳🇿 뉴질랜드'
  };

  const SEED_POSTS = [
    {
      id: 'seed-1',
      country: 'PL',
      cat: 'transport',
      city: '브로츠와프 · 바르샤바',
      title: '[폴란드] 바르샤바 공항 → 브로츠와프 배터리 공단 이동 & 한인 픽업/통역 팁',
      body: '브로츠와프(코비에르지체) LG에너지솔루션 및 협력사 출장 가시는 분들 참고하세요. 바르샤바 쇼팽공항에서 LOT 국내선 환승이 가장 편하고, 장비 가방이 많으면 한인 벤 픽업(약 3시간 30분 소요)이 훨씬 효율적입니다. 브로츠와프 시내 한인식당(코리아나 등) 주변에 비즈니스 호텔 잡으시면 출퇴근 수월합니다.',
      author: '배터리설비팀장',
      pin: '0000',
      likes: 42,
      date: '2026-10-28',
      pinned: true,
      replies: [
        { by: '브로츠와프주재원', text: '겨울철엔 A8 고속도로 안개 심하니 오전 일찍 미팅이면 전날 국내선 이동 강추합니다!' },
        { by: '김책임(카토비체)', text: '카토비체~브로츠와프 구간 일일 기사님 연락처도 댓글로 공유 가능합니다.' }
      ]
    },
    {
      id: 'seed-2',
      country: 'IN',
      cat: 'stay',
      city: '구르가온 · 노이다 · 첸나이',
      title: '[인도] 구르가온(델리 NCR) & 첸나이 장기 출장자 한인 게스트하우스·전담 기사 총정리',
      body: '인도는 우버(Uber)/올라(Ola)도 되지만 공단(마네사르·노이다·스리페룸부두르) 출퇴근은 무조건 검증된 데일리 이노바(Innova) 기사님 섭외가 필수입니다. 생수는 반드시 Bisleri/Kinley 밀봉 확인하시고, 구르가온 섹터 29·골프코스로드 쪽 한인 호텔은 한식 조식+세탁 포함이라 2주 이상 출장 시 컨디션 관리에 최고입니다.',
      author: '델리솔루션PM',
      pin: '0000',
      likes: 39,
      date: '2026-10-28',
      pinned: true,
      replies: [
        { by: '첸나이엔지니어', text: '첸나이 현대/모비스 벤더 공단 쪽도 이노바 크리스타 일일 대절 시세 약 3,500~4,500루피 선입니다.' }
      ]
    },
    {
      id: 'seed-3',
      country: 'ID',
      cat: 'visa',
      city: '자카르타 SCBD · 치카랑 · 카라왕',
      title: '[인도네시아] 2026 자카르타 수카르노하타 공항 입국 e-VOA & 공장 방문 비자 주의사항',
      body: '단순 바이어 미팅·세미나 참석은 e-VOA(도착비자)로 가능하지만, 치카랑(MM2100, 델타실리콘)·카라왕 공단 생산라인 내부에서 설비 세팅·점검 작업을 하실 엔지니어분들은 반드시 C2/상용비자 등 목적에 맞는 비자를 발급받으셔야 합니다. 인니웹(Indoweb) 구인/업체 게시판에서 현지 비자 에이전시 비교해보세요!',
      author: '치카랑박법인장',
      pin: '0000',
      likes: 51,
      date: '2026-10-27',
      pinned: true,
      replies: [
        { by: '수라바야바이어', text: '90일 이상 체류 시 스마트폰 IMEI 등록도 공항 세관에서 미리 체크하세요.' }
      ]
    },
    {
      id: 'seed-4',
      country: 'VN',
      cat: 'transport',
      city: '하노이 · 박닌 · 타이응우옌',
      title: '[베트남] 노이바이 공항 → 박닌/옌퐁/타이응우옌 공단 1일 렌트카(7인승/리무진) 시세 공유',
      body: '하노이 노이바이 공항에서 박닌 옌퐁공단까지는 차로 35~40분이라 시내 들어갔다가 나오는 것보다 공항 픽업 후 바로 공단 미팅 → 하노이 미딩(한인타운) 체크인 코스가 가장 깔끔합니다. 현지 기사님 소통은 카카오톡이나 잘로(Zalo) 번역 기능으로 100% 가능합니다.',
      author: '박닌출장러',
      pin: '0000',
      likes: 34,
      date: '2026-10-27',
      replies: []
    },
    {
      id: 'seed-5',
      country: 'SA',
      cat: 'visa',
      city: '리야드 · 담맘 · 주바일',
      title: '[사우디] 리야드·주바일 플랜트/건설 현장 출장 시 복장·비자·렌트카 실전 팁',
      body: '사우디 리야드 킹칼리드 공항 입국 후 시내 이동은 우버(Uber)와 카림(Careem)이 가장 확실합니다. 주바일·담맘 아람코 프로젝트 현장 방문 시에는 사전 Gate Pass 승인에 최소 5~7영업일이 걸리니 현지 스폰서/파트너사에 여권 사본과 비자 번호를 미리 전달하세요.',
      author: '중동플랜트전무',
      pin: '0000',
      likes: 28,
      date: '2026-10-26',
      replies: []
    },
    {
      id: 'seed-6',
      country: 'MX',
      cat: 'stay',
      city: '몬테레이 · 페스케리아 · 케레타로',
      title: '[멕시코] 몬테레이(기아/성우/배터리 협력사) 출장자 안전 숙소 지역(산페드로) & 이동 수칙',
      body: '몬테레이 출장 오시면 숙소는 산페드로 가르사 가르시아(San Pedro Garza García)나 아포다카 비즈니스 호텔 라인이 가장 안전합니다. 공항에서 일반 택시보다 검증된 한인 픽업 차량이나 호텔 공식 픽업을 이용하시고, 야간 도보 이동은 피하시는 게 좋습니다.',
      author: '몬테레이주재원',
      pin: '0000',
      likes: 31,
      date: '2026-10-26',
      replies: [
        { by: '케레타로김과장', text: '케레타로·과나후아토 출장자분들도 주간 고속도로 이동 원칙 꼭 지키세요!' }
      ]
    },
    {
      id: 'seed-7',
      country: 'HU',
      cat: 'transport',
      city: '부다페스트 · 데브레첸 · 코마롬 · 이반차',
      title: '[헝가리] 부다페스트 공항 → 데브레첸/코마롬/이반차 배터리 공단 렌트카 & 고속도로 비넷(Matrica) 팁',
      body: '헝가리는 고속도로 톨게이트가 없고 전자 비넷(e-Matrica) 방식입니다. 공항 렌트카 픽업 시 헝가리 전역 비넷 포함 여부를 꼭 확인하세요! 데브레첸(에코프로/삼성SDI 라인)은 부다페스트에서 M3 고속도로로 약 2시간 20분 걸립니다.',
      author: '부다페스트엔지니어',
      pin: '0000',
      likes: 26,
      date: '2026-10-25',
      replies: []
    },
    {
      id: 'seed-8',
      country: 'CZ',
      cat: 'biz',
      city: '프라하 · 오스트라바 · 두코바니',
      title: '[체코] 오스트라바(현대차 노쇼비체) 및 원전·기계 프로젝트 한-체 기술통역 섭외 팁',
      body: '체코 프라하 중앙역에서 오스트라바까지는 레기오젯(RegioJet)이나 체코철도(ČD) 펜돌리노 열차 비즈니스석 타시면 3시간 남짓에 콘센트·와이파이 다 되어서 업무 보며 이동하기 좋습니다. 현지 기술통역은 최소 2주 전 예약이 안전합니다.',
      author: '프라하비즈',
      pin: '0000',
      likes: 22,
      date: '2026-10-25',
      replies: []
    },
    {
      id: 'seed-9',
      country: 'US',
      cat: 'stay',
      city: '조지아 사바나 · 둘루스 · 텍사스 테일러',
      title: '[미국] 조지아 현대 메타플랜트(사바나/풀러) & 텍사스 테일러 삼성 반도체 출장 생활 정보',
      body: '조지아 사바나 공단 출장 시 숙소는 Pooler(풀러)나 Savannah Airport 근처 Residence Inn / TownePlace Suites가 주방이 있어 장기 출장자에게 인기입니다. 주말에는 애틀랜타 둘루스(H마트·한인식당 밀집)에서 장을 봐오거나 사바나 한인 마트를 이용하시면 됩니다.',
      author: '조지아현장소장',
      pin: '0000',
      likes: 37,
      date: '2026-10-24',
      replies: []
    },
    {
      id: 'seed-10',
      country: 'CN',
      cat: 'visa',
      city: '상하이 · 선전 · 쑤저우 · 칭다오',
      title: '[중국] 2026 중국 출장 필수 세팅 3종: 알리페이(Alipay) 한국카드 연동 + 고덕지도 + 로밍/eSIM',
      body: '중국은 현금이나 일반 플라스틱 카드 결제가 거의 안 되고 택시·식당·지하철 모두 알리페이(Alipay) 또는 위챗페이 QR로 결제합니다. 출국 전 한국에서 미리 알리페이 앱 깔고 트래블로그/트래블월렛/해외겸용 비자·마스터카드를 등록해 두세요. 200위안 이하 결제 시 3% 수수료도 면제됩니다!',
      author: '상하이주재원',
      pin: '0000',
      likes: 48,
      date: '2026-10-24',
      replies: []
    },
    {
      id: 'seed-11',
      country: 'TW',
      cat: 'biz',
      city: '타이베이 · 신주(Hsinchu) · 가오슝',
      title: '[대만] 신주과학단지(TSMC·반도체 장비/소재) 출장 시 고속철도(THSR) 이동 & 숙소 팁',
      body: '타오위안 공항에서 MRT로 타오위안 고속철도역 이동 후 THSR을 타면 신주(Hsinchu)역까지 10분이면 도착합니다! 신주과학단지(HSP) 인근 호텔은 세미나 시즌에 방이 빨리 차니 주베이(Zhubei)역 주변 비즈니스 호텔을 미리 잡으세요.',
      author: '판교반도체영업',
      pin: '0000',
      likes: 25,
      date: '2026-10-23',
      replies: []
    },
    {
      id: 'seed-12',
      country: 'UZ',
      cat: 'transport',
      city: '타슈켄트 · 사마르칸트',
      title: '[우즈베키스탄] 타슈켄트 출장 시 얀덱스고(Yandex Go) 택시 앱 & 거주등록(레기스트라치아) 필수 체크',
      body: '우즈베키스탄·카자흐스탄 출장 가실 때는 우버 대신 무조건 Yandex Go 앱을 한국에서 미리 설치해 가세요. 요금이 투명하고 카드 결제도 됩니다. 또한 호텔 체크아웃 시 숙박등록증(Registration slip)을 꼭 챙기셔야 출국 심사 때 문제가 없습니다!',
      author: '타슈켄트EPC',
      pin: '0000',
      likes: 19,
      date: '2026-10-23',
      replies: []
    },
    {
      id: 'seed-13',
      country: 'AE',
      cat: 'biz',
      city: '두바이 DWTC · 아부다비',
      title: '[UAE] 두바이 월드트레이드센터(DWTC) 전시회(GITEX·Arab Health·ADIPEC) 출장 동선 팁',
      body: '전시회 기간에는 DWTC 주변 셰이크 자예드 로드 교통체증이 극심합니다. 두바이 메트로 레드라인(World Trade Centre 역) 바로 앞 호텔이나 DIFC/다운타운 메트로 역세권 호텔을 잡으시면 정시 이동에 가장 유리합니다.',
      author: '두바이지사장',
      pin: '0000',
      likes: 23,
      date: '2026-10-22',
      replies: []
    },
    {
      id: 'seed-14',
      country: 'DE',
      cat: 'stay',
      city: '프랑크푸르트 · 뮌헨 · 뒤셀도르프',
      title: '[독일] 프랑크푸르트 메세(Messe) & 뮌헨 전시회 출장 시 DB 열차 파업 대비 및 한인 민박/호텔 팁',
      body: '독일 출장 시 DB Navigator 앱은 필수이며, 간혹 철도 파업이나 지연이 있으니 도시간 이동은 FlixBus나 렌트카 대안도 함께 체크하세요. 프랑크푸르트 중앙역 인근이나 에쉬본(Eschborn, 한국 기업 법인 밀집지역) 쪽 숙소가 비즈니스에 편리합니다.',
      author: '유럽영업팀',
      pin: '0000',
      likes: 27,
      date: '2026-10-21',
      replies: []
    },
    {
      id: 'seed-15',
      country: 'TH',
      cat: 'transport',
      city: '방콕 · 촌부리 · 라용(EEC 공단)',
      title: '[태국] 수완나품 공항 → 촌부리/라용(아마타시티·보윈 공단) 출장 차량 및 파타야 숙소 팁',
      body: '태국 동부해안공단(촌부리·라용) 출장자분들은 방콕 시내보다 수완나품 공항에서 바로 7번 고속도로를 타고 시라차(Sriracha)나 파타야 북부 비즈니스 호텔에 베이스캠프를 차리시는 게 이동 시간을 하루 2시간 이상 아낍니다.',
      author: '라용공단매니저',
      pin: '0000',
      likes: 21,
      date: '2026-10-20',
      replies: []
    }
  ];

  const SEED_PARTNERS = [
    {
      country: 'ID',
      tier: 'premium',
      cat: 'transport',
      name: '자카르타·치카랑 K-비즈 렌트카 & 통역 센터',
      area: '인도네시아 자카르타 SCBD · 치카랑(MM2100/델타실리콘) · 카라왕 공단',
      title: '공단 출장 전담 기사 포함 이노바/알파드 일일 대절 & 인니 기술통역',
      price: '출장 일정별 견적 문의 (세금계산서·법인카드 영수증 가능)',
      desc: '수카르노하타 공항 픽업부터 치카랑·브카시·카라왕 공단 종일 동행, 한-인니 바이어 미팅 전문 통역원 배정.',
      sample: true,
      pinned: true
    },
    {
      country: 'VN',
      tier: 'premium',
      cat: 'transport',
      name: '비나 K-모빌리티 & 비즈니스 통역 (하노이·호치민)',
      area: '베트남 하노이·박닌·타이응우옌 / 호치민·빈증·동나이 공단',
      title: '노이바이/떤선녓 공항 픽업 · 7인승 카니발/리무진 일일 기사 대절',
      price: '제휴 출장가 문의 (카카오톡·Zalo 실시간 배차)',
      desc: '삼성·LG 1~3차 벤더 공단 지리에 능통한 베테랑 기사님 & 베트남어 비즈니스 통역 매칭.',
      sample: true,
      pinned: true
    },
    {
      country: 'PL',
      tier: 'premium',
      cat: 'consulting',
      name: '폴란드 브로츠와프·바르샤바 K-엔지니어링 서포트',
      area: '폴란드 바르샤바 · 브로츠와프 · 카토비체 · 그단스크',
      title: '배터리·방산 현장 한-폴 기술통역 · 9인승 벤 공항픽업 · 장기출장 숙소',
      price: '프로젝트 기간별 맞춤 견적 문의',
      desc: '바르샤바 공항 픽업, 브로츠와프 산업단지 출퇴근 차량 지원 및 폴란드 노동허가·거주증 행정 자문.',
      sample: true,
      pinned: true
    },
    {
      country: 'IN',
      tier: 'standard',
      cat: 'stay',
      name: '구르가온·첸나이 K-비즈니스 스위트 & 전담 카서비스',
      area: '인도 구르가온(델리 NCR) · 노이다 · 첸나이 · 벵갈루루',
      title: '한식 조식·런치박스 제공 비즈니스 레지던스 + 검증된 이노바 기사 배정',
      price: '장단기 출장 패키지 문의',
      desc: '출장자 물갈이 걱정 없는 정갈한 한식 조식·도시락 케어, 24시간 안전 보안 및 공단 출퇴근 전담 차량.',
      sample: true,
      pinned: false
    },
    {
      country: 'US',
      tier: 'standard',
      cat: 'consulting',
      name: '조지아·텍사스 K-비즈 컨시어지 & 회계/법인 자문',
      area: '미국 조지아(사바나·둘루스) · 텍사스(오스틴·테일러·달라스)',
      title: '미국 공장 셋업 출장자 장기 레지던스 · 법인설립 · CPA 세무 상담',
      price: '초회 비즈니스 상담 문의',
      desc: '조지아 메타플랜트 및 텍사스 반도체 벨트 진출 협력사를 위한 현지 정착·차량·회계 원스톱 지원.',
      sample: true,
      pinned: false
    },
    {
      country: 'SA',
      tier: 'standard',
      cat: 'transport',
      name: '중동(리야드·담맘·두바이) K-플랜트 출장 서포트',
      area: '사우디 리야드·주바일·담맘 / UAE 두바이·아부다비',
      title: '사우디 상용비자 초청장 자문 · 공항 VIP 패스트트랙 · 전담 SUV 대절',
      price: '일정별 견적 문의',
      desc: '아람코·네옴·UAE 전시회 출장 임직원을 위한 현지 차량, 아랍어/영어 통역 및 비즈니스 호텔 수배.',
      sample: true,
      pinned: false
    }
  ];

  function getPosts() {
    const saved = LS('kbiz_posts_v1');
    return Array.isArray(saved) && saved.length ? saved : SEED_POSTS;
  }

  function savePosts(list) {
    LS('kbiz_posts_v1', list);
  }

  function getPartners() {
    const saved = LS('kbiz_partners_v1');
    return Array.isArray(saved) && saved.length ? saved : SEED_PARTNERS;
  }

  function savePartners(list) {
    LS('kbiz_partners_v1', list);
  }

  function syncTopBar() {
    const member = LS('kbiz_member');
    $$('[data-member-btn]').forEach((b) => {
      b.textContent = member ? `✓ ${member}` : '출장자 간편 닉네임 설정';
      b.classList.toggle('member-active', !!member);
    });
    $$('[data-admin-btn]').forEach((b) => {
      b.textContent = isAdmin() ? 'Admin ON' : 'Admin';
      b.classList.toggle('admin-active', isAdmin());
    });
    const adminPartnerBtn = $('#adminAddPartnerBtn');
    if (adminPartnerBtn) {
      adminPartnerBtn.style.display = isAdmin() ? 'inline-flex' : 'none';
    }
  }

  /* 1. Main Page Directory Filtering */
  function initDirectoryFilter() {
    const grid = $('#countryGrid');
    if (!grid) return;

    const searchInput = $('#countrySearch');
    const countEl = $('#countryCount');
    let currentContinent = 'all';

    function applyFilter() {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      let visible = 0;
      $$('.country-card', grid).forEach((card) => {
        const region = card.dataset.region || '';
        const ownBoard = card.dataset.ownboard === 'true';
        const text = card.textContent.toLowerCase();
        const matchRegion =
          currentContinent === 'all' ||
          (currentContinent === 'ownboard' ? ownBoard : region === currentContinent);
        const matchQuery = !q || text.includes(q);
        const show = matchRegion && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (countEl) countEl.textContent = String(visible);
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    $$('.continent-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.continent-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentContinent = tab.dataset.region || 'all';
        applyFilter();
      });
    });

    $$('[data-quick-country]').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const targetCode = chip.dataset.quickCountry;
        $$('.continent-tab').forEach((t) => t.classList.remove('active'));
        const allTab = $('.continent-tab[data-region="all"]');
        if (allTab) allTab.classList.add('active');
        currentContinent = 'all';
        if (searchInput) searchInput.value = '';
        applyFilter();
        const card = $(`#country-${targetCode}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.boxShadow = '0 0 0 3px #2563eb';
          setTimeout(() => { card.style.boxShadow = ''; }, 2200);
        }
      });
    });
  }

  /* 2. Render Recent Board Preview on Index */
  function renderRecentBoardPreview() {
    const wrap = $('#recentBoardPreview');
    if (!wrap) return;
    const list = getPosts().slice(0, 6);
    wrap.innerHTML = list
      .map(
        (p) => `
      <article class="post-card ${p.pinned ? 'pinned-post' : ''}">
        <div class="post-meta-top">
          <div class="post-badges">
            <span class="badge-country">${esc(COUNTRY_NAMES[p.country] || p.country)}</span>
            <span class="badge-cat">${esc(CAT_LABELS[p.cat] || p.cat)}</span>
            ${p.city ? `<span class="badge-city">📍 ${esc(p.city)}</span>` : ''}
          </div>
          <span>${esc(p.author)} · ${esc(p.date)}</span>
        </div>
        <h3 class="post-title"><a href="board.html?country=${esc(p.country)}" style="color:inherit;">${esc(p.title)}</a></h3>
        <p class="post-body" style="margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(p.body)}</p>
        <div style="font-size:0.78rem;color:#2563eb;font-weight:700;">
          <a href="board.html?country=${esc(p.country)}">해당 국가 게시판에서 전문 &amp; 댓글 보기 (${(p.replies || []).length}) →</a>
        </div>
      </article>`
      )
      .join('');
  }

  /* 3. Board Page Rendering & Interaction */
  let activeBoardCountry = 'all';
  let activeBoardCat = 'all';

  function renderBoard() {
    const listEl = $('#boardPostList');
    if (!listEl) return;

    const searchQ = (($('#boardSearchInput') || {}).value || '').trim().toLowerCase();
    const all = getPosts();
    const filtered = all.filter((p) => {
      const cMatch = activeBoardCountry === 'all' || p.country === activeBoardCountry;
      const catMatch = activeBoardCat === 'all' || p.cat === activeBoardCat;
      const qMatch =
        !searchQ ||
        (p.title + ' ' + p.body + ' ' + (p.city || '') + ' ' + (COUNTRY_NAMES[p.country] || ''))
          .toLowerCase()
          .includes(searchQ);
      return cMatch && catMatch && qMatch;
    });

    const headerLabel = $('#boardCurrentFilterLabel');
    if (headerLabel) {
      headerLabel.textContent =
        activeBoardCountry === 'all'
          ? `전 세계 30개국 통합 출장·교민 실전 게시글 (${filtered.length}건)`
          : `${COUNTRY_NAMES[activeBoardCountry] || activeBoardCountry} 출장·교민 실전 게시글 (${filtered.length}건)`;
    }

    if (!filtered.length) {
      listEl.innerHTML = `<div class="post-card" style="text-align:center;padding:32px 16px;">
        <p style="font-weight:700;color:#0f172a;margin:0 0 8px;">선택한 국가/카테고리에 아직 등록된 게시글이 없습니다.</p>
        <p style="font-size:0.85rem;color:#64748b;margin:0 0 14px;">첫 번째 출장 질문이나 현지 통역·차량·숙소 팁을 남겨보세요!</p>
        <button class="btn btn-emerald" data-open-modal="writePostModal">+ 첫 게시글 작성하기</button>
      </div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((p) => {
        const realIdx = all.findIndex((x) => x.id === p.id);
        const liked = LS('kbiz_liked_' + p.id);
        const replies = p.replies || [];
        return `
      <article class="post-card ${p.pinned ? 'pinned-post' : ''}">
        <div class="post-meta-top">
          <div class="post-badges">
            ${p.pinned ? '<span class="badge-cat" style="background:#fef3c7;color:#92400e;border-color:#fde68a;">📌 필독</span>' : ''}
            <span class="badge-country">${esc(COUNTRY_NAMES[p.country] || p.country)}</span>
            <span class="badge-cat">${esc(CAT_LABELS[p.cat] || p.cat)}</span>
            ${p.city ? `<span class="badge-city">📍 ${esc(p.city)}</span>` : ''}
          </div>
          <span>✍ ${esc(p.author)} · ${esc(p.date)}</span>
        </div>
        <h3 class="post-title">${esc(p.title)}</h3>
        <p class="post-body">${esc(p.body)}</p>
        <div class="post-actions">
          <button class="action-chip ${liked ? 'liked' : ''}" data-like-id="${esc(p.id)}">♥ 도움됨 ${p.likes || 0}</button>
          <button class="action-chip" data-toggle-reply="${realIdx}">💬 댓글 ${replies.length}</button>
          <button class="action-chip" data-del-post="${realIdx}">🗑 삭제</button>
        </div>
        <div class="replies-box" id="replyBox-${realIdx}">
          ${replies
            .map(
              (r) =>
                `<div class="reply-item"><b>${esc(r.by)}</b>: ${esc(r.text)}</div>`
            )
            .join('')}
          <form data-reply-idx="${realIdx}" style="display:flex;gap:6px;margin-top:8px;">
            <input class="search-input" name="replyText" placeholder="현지 답변이나 추가 질문을 남겨주세요..." style="padding:7px 10px;font-size:0.82rem;" required>
            <button class="btn btn-royal" style="padding:7px 12px;font-size:0.8rem;white-space:nowrap;">댓글 등록</button>
          </form>
        </div>
      </article>`;
      })
      .join('');
  }

  function initBoardPage() {
    if (!$('#boardPostList')) return;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const cParam = (params.get('country') || '').toUpperCase();
      if (cParam && COUNTRY_NAMES[cParam]) {
        activeBoardCountry = cParam;
        const countrySelect = $('#writeCountrySelect');
        if (countrySelect) countrySelect.value = cParam;
      }
    } catch (e) {}

    $$('[data-board-country]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.boardCountry === activeBoardCountry);
      btn.addEventListener('click', () => {
        activeBoardCountry = btn.dataset.boardCountry;
        $$('[data-board-country]').forEach((b) =>
          b.classList.toggle('active', b.dataset.boardCountry === activeBoardCountry)
        );
        const countrySelect = $('#writeCountrySelect');
        if (countrySelect && activeBoardCountry !== 'all') {
          countrySelect.value = activeBoardCountry;
        }
        renderBoard();
      });
    });

    $$('[data-board-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeBoardCat = btn.dataset.boardCat;
        $$('[data-board-cat]').forEach((b) =>
          b.classList.toggle('active', b.dataset.boardCat === activeBoardCat)
        );
        renderBoard();
      });
    });

    const sInput = $('#boardSearchInput');
    if (sInput) sInput.addEventListener('input', renderBoard);

    renderBoard();
  }

  /* 4. Partners Page Rendering */
  let activePartnerCat = 'all';
  function renderPartners() {
    const grid = $('#partnersGrid');
    if (!grid) return;
    const all = getPartners();
    const filtered = all.filter(
      (p) => activePartnerCat === 'all' || p.cat === activePartnerCat || p.tier === activePartnerCat
    );
    grid.innerHTML = filtered
      .map((p, idx) => {
        return `
      <article class="partner-card ${p.tier === 'premium' ? 'tier-premium' : ''}">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px;">
            <span class="badge-country">${esc(COUNTRY_NAMES[p.country] || p.country)}</span>
            <span class="badge-sample-ad">${p.sample ? 'Sample Ad Slot (입점·배너 홍보 예시)' : 'Official Partner'}</span>
          </div>
          <div style="font-size:0.78rem;color:#2563eb;font-weight:700;margin-bottom:4px;">${esc(p.name)}</div>
          <h3 style="font-size:1.02rem;font-weight:800;color:#0f172a;margin:0 0 8px;">${esc(p.title)}</h3>
          <div class="cities-bar" style="margin-bottom:8px;">📍 <strong>서비스 지역:</strong> ${esc(p.area)}</div>
          <p style="font-size:0.84rem;color:#475569;margin:0 0 10px;">${esc(p.desc)}</p>
        </div>
        <div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px 10px;border-radius:7px;font-size:0.8rem;font-weight:700;color:#0f172a;margin-bottom:10px;">
            💰 ${esc(p.price)}
          </div>
          <div style="display:flex;gap:6px;">
            <a class="btn btn-royal" style="flex:1;padding:8px 10px;font-size:0.8rem;" href="mailto:duckcheonkorea@gmail.com?subject=${encodeURIComponent('[K-비즈트립 파트너 입점/제휴 문의] ' + p.name)}">
              ${p.sample ? '📩 이 자리 입점·광고 문의' : '📩 제휴·견적 문의'}
            </a>
            ${isAdmin() ? `<button class="btn btn-outline" data-del-partner="${idx}" style="padding:8px 10px;font-size:0.8rem;">삭제</button>` : ''}
          </div>
        </div>
      </article>`;
      })
      .join('');
  }

  function initPartnersPage() {
    if (!$('#partnersGrid')) return;
    $$('[data-partner-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePartnerCat = btn.dataset.partnerFilter;
        $$('[data-partner-filter]').forEach((b) =>
          b.classList.toggle('active', b.dataset.partnerFilter === activePartnerCat)
        );
        renderPartners();
      });
    });
    renderPartners();
  }

  /* 5. Article Comments */
  function renderArticleComments() {
    const box = $('#articleCmtList');
    if (!box) return;
    const key = 'kbiz_cmt_' + location.pathname;
    const list = LS(key) || [];
    if (!list.length) {
      box.innerHTML = '<p style="font-size:0.85rem;color:#64748b;">아직 등록된 출장 후기·질문이 없습니다. 첫 질문을 남겨보세요!</p>';
      return;
    }
    box.innerHTML = list
      .map(
        (c, i) => `
      <div class="reply-item" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;">
        <div>
          <b>${esc(c.author || '출장자')}</b> <span class="badge-cat">${esc(c.type || '질문/팁')}</span> <small style="color:#64748b;">${esc(c.date)}</small>
          <div style="margin-top:4px;color:#1e293b;">${esc(c.text)}</div>
        </div>
        <button class="action-chip" data-del-cmt="${i}">삭제</button>
      </div>`
      )
      .join('');
  }

  /* Global Click & Submit Handlers */
  document.addEventListener('click', (e) => {
    const mBtn = e.target.closest('[data-member-btn]');
    if (mBtn) {
      if (LS('kbiz_member')) {
        LS('kbiz_member', null);
      } else {
        const name = prompt('게시판에서 사용할 출장자/주재원 닉네임을 입력하세요:');
        if (name && name.trim()) LS('kbiz_member', name.trim().slice(0, 20));
      }
      syncTopBar();
    }

    const aBtn = e.target.closest('[data-admin-btn]');
    if (aBtn) {
      if (isAdmin()) {
        LS('kbiz_admin', false);
      } else {
        const pw = prompt('관리자(Admin) 비밀번호를 입력하세요:');
        if (pw === 'duckcheonadmin') {
          LS('kbiz_admin', true);
        } else if (pw !== null) {
          alert('비밀번호가 일치하지 않습니다.');
        }
      }
      syncTopBar();
      renderBoard();
      renderPartners();
    }

    const openBtn = e.target.closest('[data-open-modal]');
    if (openBtn) {
      const mId = openBtn.dataset.openModal;
      if (mId === 'partnerModal' && !isAdmin()) {
        alert('관리자 전용 기능입니다. 현지 업체 입점 및 배너 광고 문의는 duckcheonkorea@gmail.com 으로 연락해 주세요.');
        return;
      }
      const modal = $('#' + mId);
      if (modal) modal.classList.add('open');
    }

    const closeBtn = e.target.closest('.kb-modal-close');
    if (closeBtn) {
      closeBtn.closest('.kb-modal-backdrop')?.classList.remove('open');
    }

    const likeBtn = e.target.closest('[data-like-id]');
    if (likeBtn) {
      const id = likeBtn.dataset.likeId;
      const list = getPosts();
      const item = list.find((x) => x.id === id);
      if (item) {
        const k = 'kbiz_liked_' + id;
        const was = LS(k);
        item.likes = (item.likes || 0) + (was ? -1 : 1);
        LS(k, !was);
        savePosts(list);
        renderBoard();
      }
    }

    const delPostBtn = e.target.closest('[data-del-post]');
    if (delPostBtn) {
      const idx = +delPostBtn.dataset.delPost;
      const list = getPosts();
      const target = list[idx];
      if (!target) return;
      if (isAdmin() || prompt('작성 시 설정한 4자리 비밀번호(PIN)를 입력하세요:') === target.pin) {
        list.splice(idx, 1);
        savePosts(list);
        renderBoard();
        renderRecentBoardPreview();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }

    const delPartnerBtn = e.target.closest('[data-del-partner]');
    if (delPartnerBtn) {
      if (!isAdmin()) return;
      const idx = +delPartnerBtn.dataset.delPartner;
      const list = getPartners();
      list.splice(idx, 1);
      savePartners(list);
      renderPartners();
    }

    const delCmtBtn = e.target.closest('[data-del-cmt]');
    if (delCmtBtn) {
      const key = 'kbiz_cmt_' + location.pathname;
      const list = LS(key) || [];
      const idx = +delCmtBtn.dataset.delCmt;
      if (!list[idx]) return;
      if (isAdmin() || prompt('댓글 작성 시 입력한 4자리 PIN을 입력하세요:') === list[idx].pin) {
        list.splice(idx, 1);
        LS(key, list);
        renderArticleComments();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'writePostForm') {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!pin4(d.pin)) {
        alert('삭제/수정용 비밀번호는 숫자 4자리로 입력해 주세요.');
        return;
      }
      const list = getPosts();
      list.unshift({
        id: 'post-' + Date.now(),
        country: d.country || 'PL',
        cat: d.cat || 'qna',
        city: d.city || '',
        title: d.title,
        body: d.body,
        author: LS('kbiz_member') || d.author || '해외출장자',
        pin: d.pin,
        likes: 1,
        date: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10),
        replies: []
      });
      savePosts(list);
      f.reset();
      f.closest('.kb-modal-backdrop')?.classList.remove('open');
      renderBoard();
      renderRecentBoardPreview();
    }

    if (f.dataset.replyIdx !== undefined) {
      e.preventDefault();
      const idx = +f.dataset.replyIdx;
      const txt = (f.replyText.value || '').trim();
      if (!txt) return;
      const list = getPosts();
      if (list[idx]) {
        list[idx].replies = list[idx].replies || [];
        list[idx].replies.push({
          by: LS('kbiz_member') || '현지동료',
          text: txt
        });
        savePosts(list);
        renderBoard();
      }
    }

    if (f.id === 'partnerForm') {
      e.preventDefault();
      if (!isAdmin()) {
        alert('관리자 권한이 필요합니다.');
        return;
      }
      const d = Object.fromEntries(new FormData(f));
      const list = getPartners();
      list.unshift({
        country: d.country || 'ID',
        tier: d.tier || 'standard',
        cat: d.cat || 'transport',
        name: d.name,
        area: d.area,
        title: d.title,
        price: d.price || '별도 견적 문의',
        desc: d.desc,
        sample: false,
        pinned: d.tier === 'premium'
      });
      savePartners(list);
      f.reset();
      f.closest('.kb-modal-backdrop')?.classList.remove('open');
      renderPartners();
    }

    if (f.id === 'articleCmtForm') {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!pin4(d.pin)) {
        alert('4자리 숫자 PIN을 입력해 주세요.');
        return;
      }
      const key = 'kbiz_cmt_' + location.pathname;
      const list = LS(key) || [];
      list.push({
        author: LS('kbiz_member') || d.author || '출장자',
        type: d.type || '출장팁/질문',
        text: d.text,
        pin: d.pin,
        date: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
      });
      LS(key, list);
      f.reset();
      renderArticleComments();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    syncTopBar();
    initDirectoryFilter();
    renderRecentBoardPreview();
    initBoardPage();
    initPartnersPage();
    renderArticleComments();
  });
})();
