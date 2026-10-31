/**
 * Nexora Tools - Unit Converter
 * 100% Client-Side Length, Weight, and Temperature conversions
 */

document.addEventListener('DOMContentLoaded', () => {
  const categoryTabs = document.querySelectorAll('.category-tab');
  const fromInput = document.getElementById('from-input');
  const toInput = document.getElementById('to-input');
  const fromUnitSelect = document.getElementById('from-unit');
  const toUnitSelect = document.getElementById('to-unit');
  const swapBtn = document.getElementById('swap-units-btn');
  const formulaDisplay = document.getElementById('formula-display');
  const conversionsTableBody = document.getElementById('conversions-table-body');

  let currentCategory = 'length';

  // Conversion definitions (to base unit)
  // Length base: Meter (m)
  const lengthUnits = {
    m: { name: 'Meters (m)', factor: 1 },
    km: { name: 'Kilometers (km)', factor: 1000 },
    cm: { name: 'Centimeters (cm)', factor: 0.01 },
    mm: { name: 'Millimeters (mm)', factor: 0.001 },
    mi: { name: 'Miles (mi)', factor: 1609.344 },
    yd: { name: 'Yards (yd)', factor: 0.9144 },
    ft: { name: 'Feet (ft)', factor: 0.3048 },
    in: { name: 'Inches (in)', factor: 0.0254 }
  };

  // Weight base: Kilogram (kg)
  const weightUnits = {
    kg: { name: 'Kilograms (kg)', factor: 1 },
    g: { name: 'Grams (g)', factor: 0.001 },
    mg: { name: 'Milligrams (mg)', factor: 0.000001 },
    lb: { name: 'Pounds (lb)', factor: 0.45359237 },
    oz: { name: 'Ounces (oz)', factor: 0.028349523125 },
    st: { name: 'Stone (st)', factor: 6.35029318 },
    tonne: { name: 'Metric Tonnes (t)', factor: 1000 }
  };

  // Temperature
  const tempUnits = {
    c: { name: 'Celsius (°C)' },
    f: { name: 'Fahrenheit (°F)' },
    k: { name: 'Kelvin (K)' }
  };

  function populateUnitSelects() {
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    let units = lengthUnits;
    let defaultFrom = 'm';
    let defaultTo = 'ft';

    if (currentCategory === 'weight') {
      units = weightUnits;
      defaultFrom = 'kg';
      defaultTo = 'lb';
    } else if (currentCategory === 'temperature') {
      units = tempUnits;
      defaultFrom = 'c';
      defaultTo = 'f';
    }

    Object.keys(units).forEach(key => {
      const optFrom = document.createElement('option');
      optFrom.value = key;
      optFrom.textContent = units[key].name;
      if (key === defaultFrom) optFrom.selected = true;
      fromUnitSelect.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = key;
      optTo.textContent = units[key].name;
      if (key === defaultTo) optTo.selected = true;
      toUnitSelect.appendChild(optTo);
    });

    convert();
  }

  function convertTemp(val, from, to) {
    let kelvin = 0;
    if (from === 'c') kelvin = val + 273.15;
    else if (from === 'f') kelvin = (val - 32) * (5 / 9) + 273.15;
    else kelvin = val;

    if (to === 'c') return kelvin - 273.15;
    if (to === 'f') return (kelvin - 273.15) * (9 / 5) + 32;
    return kelvin;
  }

  function convert() {
    const fromVal = parseFloat(fromInput.value);
    if (isNaN(fromVal)) {
      toInput.value = '';
      formulaDisplay.textContent = '--';
      return;
    }

    const fromKey = fromUnitSelect.value;
    const toKey = toUnitSelect.value;

    let result = 0;

    if (currentCategory === 'length') {
      const baseMeters = fromVal * lengthUnits[fromKey].factor;
      result = baseMeters / lengthUnits[toKey].factor;
      formulaDisplay.textContent = `1 ${lengthUnits[fromKey].name} = ${(lengthUnits[fromKey].factor / lengthUnits[toKey].factor).toFixed(6).replace(/\.?0+$/, '')} ${lengthUnits[toKey].name}`;
    } else if (currentCategory === 'weight') {
      const baseKg = fromVal * weightUnits[fromKey].factor;
      result = baseKg / weightUnits[toKey].factor;
      formulaDisplay.textContent = `1 ${weightUnits[fromKey].name} = ${(weightUnits[fromKey].factor / weightUnits[toKey].factor).toFixed(6).replace(/\.?0+$/, '')} ${weightUnits[toKey].name}`;
    } else if (currentCategory === 'temperature') {
      result = convertTemp(fromVal, fromKey, toKey);
      if (fromKey === 'c' && toKey === 'f') formulaDisplay.textContent = `(°C × 9/5) + 32 = °F`;
      else if (fromKey === 'f' && toKey === 'c') formulaDisplay.textContent = `(°F − 32) × 5/9 = °C`;
      else formulaDisplay.textContent = `Direct thermodynamic temperature formula`;
    }

    // Format output
    if (Math.abs(result) < 0.000001 && result !== 0) {
      toInput.value = result.toExponential(4);
    } else {
      toInput.value = parseFloat(result.toFixed(6)).toString();
    }

    updateTable(fromVal, fromKey);
  }

  function updateTable(val, fromKey) {
    conversionsTableBody.innerHTML = '';
    let units = currentCategory === 'length' ? lengthUnits : (currentCategory === 'weight' ? weightUnits : tempUnits);

    Object.keys(units).forEach(key => {
      let convertedVal = 0;
      if (currentCategory === 'length') {
        const baseMeters = val * lengthUnits[fromKey].factor;
        convertedVal = baseMeters / lengthUnits[key].factor;
      } else if (currentCategory === 'weight') {
        const baseKg = val * weightUnits[fromKey].factor;
        convertedVal = baseKg / weightUnits[key].factor;
      } else {
        convertedVal = convertTemp(val, fromKey, key);
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding: 0.6rem 0.85rem; border-bottom: 1px solid var(--border-color); font-weight: 500;">${units[key].name}</td>
        <td style="padding: 0.6rem 0.85rem; border-bottom: 1px solid var(--border-color); font-family: monospace; font-size: 0.95rem; color: var(--accent-cyan); text-align: right;">${parseFloat(convertedVal.toFixed(4)).toString()}</td>
      `;
      conversionsTableBody.appendChild(row);
    });
  }

  // Swap Units
  swapBtn.addEventListener('click', () => {
    const temp = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = temp;
    convert();
  });

  // Category Tabs
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      populateUnitSelects();
    });
  });

  fromInput.addEventListener('input', convert);
  fromUnitSelect.addEventListener('change', convert);
  toUnitSelect.addEventListener('change', convert);

  // Initialize
  fromInput.value = '1';
  populateUnitSelects();
});
