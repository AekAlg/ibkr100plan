const holdings = [
  { name: 'CapitaLand Ascendas REIT', ticker: 'A17U', sector: 'صناعي وبيانات', weight: 20, yield: 6.2, currency: 'USD' },
  { name: 'CapitaLand Integrated Commercial Trust', ticker: 'C38U', sector: 'مولات ومكاتب', weight: 10, yield: 5.1, currency: 'USD' },
  { name: 'Parkway Life REIT', ticker: 'C2PU', sector: 'رعاية صحية', weight: 5, yield: 4.3, currency: 'USD' },
  { name: 'CapitaLand Ascott Trust', ticker: 'HMN', sector: 'فنادق وسكن', weight: 15, yield: 6.5, currency: 'USD' },
  { name: 'Keppel Infrastructure Trust', ticker: 'A7RU', sector: 'بنية تحتية', weight: 15, yield: 7.6, currency: 'USD' },
  { name: 'NetLink NBN Trust', ticker: 'CJLU', sector: 'اتصالات وألياف', weight: 10, yield: 5.55, currency: 'USD' },
  { name: 'ESR REIT', ticker: '9A4U', sector: 'صناعي ولوجستي', weight: 10, yield: 8.5, currency: 'USD' },
  { name: 'Starwood Property Trust', ticker: 'STWD', sector: 'ائتمان عقاري', weight: 15, yield: 8.36, currency: 'USD' }
];

const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const percent = (value) => `${value.toFixed(2)}%`;

function renderHoldings(capital, usTax) {
  const rows = holdings.map((holding) => {
    const adjustedYield = holding.ticker === 'STWD' ? holding.yield * ((100 - usTax) / 70) : holding.yield;
    return `<div class="holding-row"><div class="holding-name"><strong>${holding.name}</strong><small>${holding.ticker}</small></div><div class="holding-sector">${holding.sector}</div><div class="holding-weight">${holding.weight}%</div><div class="holding-yield">${adjustedYield.toFixed(2)}%</div><div class="holding-amount">${money(capital * holding.weight / 100)}</div></div>`;
  }).join('');
  $('holdingsRows').innerHTML = rows;
}

function readNumber(id, fallback) {
  const value = Number($(id).value);
  return Number.isFinite(value) ? value : fallback;
}

function updateSimulation() {
  const capital = readNumber('capital', 100000);
  const growth = readNumber('growthRate', 3);
  const usTax = readNumber('usTax', 30);
  const downside = readNumber('downside', 15);
  const batches = ['batchOne', 'batchTwo', 'batchThree'].map((id) => readNumber(id, 0));
  const totalWeight = holdings.reduce((sum, holding) => sum + holding.weight * (holding.ticker === 'STWD' ? (100 - usTax) / 70 : 1), 0);
  const weightedYield = holdings.reduce((sum, holding) => {
    const netYield = holding.ticker === 'STWD' ? holding.yield * ((100 - usTax) / 70) : holding.yield;
    return sum + holding.weight * netYield / 100;
  }, 0);
  const annual = capital * weightedYield / 100;
  const cautious = annual * (1 - downside / 100);
  const optimistic = capital * 0.075;
  $('weightedYield').textContent = percent(weightedYield);
  $('annualIncome').textContent = money(annual);
  $('monthlyIncome').textContent = money(annual / 12);
  $('cautiousIncome').textContent = money(cautious);
  $('cautiousRate').textContent = `${percent(weightedYield * (1 - downside / 100))} من رأس المال`;
  $('baseIncome').textContent = money(annual);
  $('optimisticIncome').textContent = money(optimistic);
  $('batchNote').textContent = `المجموع ${batches.reduce((sum, value) => sum + value, 0)}% · ${batches.reduce((sum, value) => sum + value, 0) === 100 ? 'مناسب للخطة الحالية' : 'تحقق من أن المجموع يساوي 100%'}`;
  $('batchNote').style.color = batches.reduce((sum, value) => sum + value, 0) === 100 ? 'var(--green)' : 'var(--red)';
  renderChart(annual, growth);
  renderHoldings(capital, usTax);
}

function renderChart(start, growth) {
  const values = Array.from({ length: 10 }, (_, index) => start * ((1 + growth / 100) ** index));
  const max = Math.max(...values);
  $('incomeChart').innerHTML = values.map((value, index) => `<div class="bar" style="--bar-height:${Math.max(8, value / max * 125)}px" data-year="${index + 1}" data-value="${money(value).replace('$', '$')}"></div>`).join('');
}

async function loadPlan() {
  try {
    const response = await fetch('plan.md');
    if (!response.ok) throw new Error('تعذر تحميل الملف');
    const markdown = await response.text();
    $('markdownContent').innerHTML = marked.parse(markdown);
    $('markdownStatus').textContent = 'المصدر: plan.md · عرض القراءة فقط · آخر تحديث 06 سبتمبر 2026';
  } catch (error) {
    $('markdownStatus').textContent = 'تعذر تحميل plan.md. شغّل الصفحة عبر خادم محلي حتى يعمل جلب الملف.';
    $('markdownContent').innerHTML = '<p>يمكن تشغيل خادم محلي من مجلد المشروع عبر الأمر <code>python -m http.server</code> ثم فتح العنوان المحلي.</p>';
  }
}

document.querySelectorAll('input').forEach((input) => input.addEventListener('input', updateSimulation));
$('resetSimulation').addEventListener('click', () => { $('capital').value = 100000; $('growthRate').value = 3; $('usTax').value = 30; $('downside').value = 15; ['batchOne', 'batchTwo', 'batchThree'].forEach((id, index) => { $(id).value = index === 0 ? 40 : 30; }); updateSimulation(); });
$('themeToggle').addEventListener('click', () => document.body.classList.toggle('soft-dark'));
updateSimulation();
loadPlan();