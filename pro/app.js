const assets = [
  { ticker: 'A17U', name: 'CapitaLand Ascendas REIT', sector: 'صناعي وبيانات', weight: 20, yield: 6.2, risk: 'متوسط', role: 'نواة المحفظة', market: 'sgx' },
  { ticker: 'C38U', name: 'CICT', sector: 'مولات ومكاتب', weight: 10, yield: 5.1, risk: 'متوسط', role: 'جودة وتنويع', market: 'sgx' },
  { ticker: 'C2PU', name: 'Parkway Life REIT', sector: 'رعاية صحية', weight: 5, yield: 4.3, risk: 'منخفض', role: 'تثبيت دفاعي', market: 'sgx' },
  { ticker: 'HMN', name: 'CapitaLand Ascott Trust', sector: 'فنادق وسكن', weight: 15, yield: 6.5, risk: 'متوسط', role: 'تنويع جغرافي', market: 'sgx' },
  { ticker: 'A7RU', name: 'Keppel Infrastructure Trust', sector: 'بنية تحتية', weight: 15, yield: 7.6, risk: 'متوسط', role: 'رفع الدخل', market: 'sgx' },
  { ticker: 'CJLU', name: 'NetLink NBN Trust', sector: 'ألياف واتصالات', weight: 10, yield: 5.55, risk: 'منخفض', role: 'تدفقات أكثر ثباتاً', market: 'sgx' },
  { ticker: '9A4U', name: 'ESR REIT', sector: 'صناعي ولوجستي', weight: 10, yield: 8.5, risk: 'مرتفع', role: 'رفع الدخل بحذر', market: 'sgx' },
  { ticker: 'STWD', name: 'Starwood Property Trust', sector: 'ائتمان عقاري', weight: 15, yield: 8.36, risk: 'مرتفع', role: 'ائتمان أمريكي', market: 'us' }
];

const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.max(0, value));
const pct = (value, digits = 1) => `${value.toFixed(digits)}%`;

function getTaxAdjustedAssets() {
  const tax = Number($('tax').value) || 30;
  return assets.map((asset) => ({ ...asset, effectiveYield: asset.ticker === 'STWD' ? asset.yield * ((100 - tax) / 70) : asset.yield }));
}

function weightedYield() {
  return getTaxAdjustedAssets().reduce((total, asset) => total + asset.weight * asset.effectiveYield / 100, 0);
}

function profile() {
  const goal = $('goal').value;
  const risk = $('risk').value;
  const horizon = Number($('horizon').value);
  const names = { income: 'مستثمر دخل', balanced: 'مستثمر متوازن', growth: 'مستثمر نمو' };
  const riskLabel = { low: 'محافظ', medium: 'متوازن', high: 'يتحمل المخاطر' };
  return { goal, risk, horizon, label: `${names[goal]} ${riskLabel[risk]}` };
}

function renderDecision() {
  const capital = Number($('capital').value) || 100000;
  const current = profile();
  const yieldValue = weightedYield();
  const annual = capital * yieldValue / 100;
  const drawdown = current.risk === 'low' ? 12 : current.risk === 'high' ? 30 : 20;
  const title = current.goal === 'growth' ? 'محفظة نمو مع دخل داعم' : current.risk === 'low' ? 'محفظة دخل أكثر دفاعية' : 'محفظة دخل متوازنة';
  const text = current.goal === 'growth' ? 'الأولوية للنمو، لذلك لا ينبغي تفسير التوزيعات الحالية كهدف وحيد. احتفظ بهامش نقدي أكبر.' : current.risk === 'low' ? 'خفّض الأصول الأعلى حساسية للفائدة والدخل، وقبل بعائد أقل مقابل هبوط محتمل أهدأ.' : 'يمكنك البدء بتوزيع متنوع على ثلاث دفعات، مع إبقاء أصول الدخل الأعلى ضمن حدود واضحة.';
  $('profileSummary').textContent = current.label;
  $('profileCapital').textContent = money(capital);
  $('profileHorizon').textContent = `${current.horizon} سنوات`;
  $('decisionTitle').textContent = title;
  $('decisionText').textContent = text;
  $('annualIncome').textContent = money(annual);
  $('annualRange').textContent = `نطاق معقول: ${money(annual * .85)} – ${money(annual * 1.11)}`;
  $('yieldRate').textContent = pct(yieldValue, 2);
  $('drawdown').textContent = `−${drawdown}%`;
  $('confidence').textContent = `${current.risk === 'medium' ? 78 : 68}% ملاءمة`;
  const reasons = current.goal === 'income' ? ['العائد النقدي هو الهدف الأول، مع عدم تجاوز وزن الأصل الواحد 20%.', '85% من التوزيع في سنغافورة يقلل أثر الاستقطاع الأمريكي المباشر.', `أفق ${current.horizon} سنوات يسمح بتوزيع الدخول بدلاً من مطاردة القاع.`] : ['المحفظة تجمع بين دخل نقدي وأصول ذات قطاعات مختلفة.', 'التنويع يقلل اعتماد النتيجة على صندوق أو قطاع واحد.', 'التنفيذ على ثلاث دفعات يخفف مخاطرة التوقيت.'];
  const risks = ['التوزيع المرتفع قد ينخفض؛ لا تتعامل معه كدخل مضمون.', 'ارتفاع الفائدة يضغط على REITs وخصوصاً الأصول ذات الدين.', 'تغير USD/SGD قد يغيّر دخلك الفعلي بعملة الإنفاق.'];
  $('reasonsList').innerHTML = reasons.map((reason) => `<li>${reason}</li>`).join('');
  $('risksList').innerHTML = risks.map((risk) => `<li>${risk}</li>`).join('');
  $('nextStep').textContent = current.risk === 'low' ? 'قارن النسخة الدفاعية بالمحفظة الأساسية قبل التنفيذ.' : 'راجع المحفظة المقترحة ثم اختبر سيناريو الضغط.';
  $('allocationYield').textContent = pct(yieldValue, 2);
  renderPortfolio(capital);
  renderScenario();
}

function renderPortfolio(capital) {
  const tax = Number($('tax').value) || 30;
  $('holdingsList').innerHTML = getTaxAdjustedAssets().map((asset) => {
    const caution = asset.ticker === 'STWD' ? `بعد استقطاع ${tax}%` : asset.risk;
    return `<article class="holding-item"><div class="holding-ticker ${asset.market}">${asset.ticker}</div><div class="holding-name"><strong>${asset.name}</strong><span>${asset.sector} · ${asset.role}</span></div><div class="holding-risk"><span>مخاطرة</span><b>${caution}</b></div><div class="holding-yield"><span>العائد</span><b>${asset.effectiveYield.toFixed(2)}%</b></div><div class="holding-weight"><span>الوزن</span><b>${asset.weight}%</b></div><div class="holding-amount">${money(capital * asset.weight / 100)}</div></article>`;
  }).join('');
}

function renderScenario() {
  const capital = Number($('capital').value) || 100000;
  const baseIncome = capital * weightedYield() / 100;
  const growth = Number($('growth').value);
  const priceShock = Number($('priceShock').value);
  const distributionCut = Number($('distributionCut').value);
  const fx = Number($('fx').value);
  const income = baseIncome * (1 - distributionCut / 100) * (1 + growth / 100);
  const marketValue = capital * (1 - priceShock / 100);
  const totalReturn = ((income + marketValue - capital) / capital * 100) + fx * .15;
  const stress = priceShock + distributionCut;
  const grade = stress >= 45 ? 'C' : stress >= 25 ? 'B−' : 'B';
  $('growthOutput').textContent = `${growth}%`;
  $('priceShockOutput').textContent = `${priceShock}%`;
  $('distributionCutOutput').textContent = `${distributionCut}%`;
  $('fxOutput').textContent = `${fx > 0 ? '+' : ''}${fx}%`;
  $('scenarioIncome').textContent = money(income);
  $('marketValue').textContent = money(marketValue);
  $('totalReturn').textContent = `${totalReturn >= 0 ? '+' : '−'}${Math.abs(totalReturn).toFixed(1)}%`;
  $('scenarioGrade').textContent = grade;
  $('scenarioLabel').textContent = stress >= 45 ? 'يتطلب مراجعة فورية' : stress >= 25 ? 'قابل للتحمل مع تحفظ' : 'سيناريو قابل للتحمل';
  const values = Array.from({ length: 5 }, (_, index) => income * ((1 + growth / 100) ** index));
  const max = Math.max(...values, 1);
  $('yearBars').innerHTML = values.map((value, index) => `<div class="year-bar" style="--height:${Math.max(10, value / max * 112)}px"><b>${money(value)}</b><span>${index + 1}</span></div>`).join('');
}

function setView(view) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === view));
  document.querySelectorAll('.view-panel').forEach((panel) => panel.classList.toggle('is-active', panel.id === `view-${view}`));
  $('mobileNav').classList.remove('is-open');
  $('mobileMenu').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: document.querySelector('.workspace').offsetTop - 80, behavior: 'smooth' });
}

document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => setView(item.dataset.view)));
document.querySelectorAll('[data-view-target]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.viewTarget)));
['capital', 'goal', 'risk', 'horizon', 'tax'].forEach((id) => $(id).addEventListener('change', renderDecision));
['growth', 'priceShock', 'distributionCut', 'fx'].forEach((id) => $(id).addEventListener('input', renderScenario));
$('calculate').addEventListener('click', renderDecision);
$('editProfile').addEventListener('click', () => { setView('decision'); $('capital').focus(); });
$('resetScenario').addEventListener('click', () => { $('growth').value = 3; $('priceShock').value = 10; $('distributionCut').value = 10; $('fx').value = 0; renderScenario(); });
$('mobileMenu').addEventListener('click', () => { const open = $('mobileNav').classList.toggle('is-open'); $('mobileMenu').setAttribute('aria-expanded', String(open)); });
$('themeToggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));
renderDecision();
