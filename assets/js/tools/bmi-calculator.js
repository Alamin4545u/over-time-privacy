/**
 * Nexora Tools — BMI Calculator Script
 * 100% Client-Side Health & Fitness Metrics
 */

(function () {
  'use strict';

  const tabMetric = document.getElementById('bmiTabMetric');
  const tabImperial = document.getElementById('bmiTabImperial');
  const metricFields = document.getElementById('bmiMetricFields');
  const imperialFields = document.getElementById('bmiImperialFields');

  // Metric Inputs
  const heightCmInput = document.getElementById('bmiHeightCm');
  const weightKgInput = document.getElementById('bmiWeightKg');

  // Imperial Inputs
  const heightFeetInput = document.getElementById('bmiHeightFeet');
  const heightInchesInput = document.getElementById('bmiHeightInches');
  const weightLbsInput = document.getElementById('bmiWeightLbs');

  const calcBtn = document.getElementById('calculateBmiBtn');

  // Results
  const scoreLabel = document.getElementById('bmiScoreLabel');
  const categoryLabel = document.getElementById('bmiCategoryBadge');
  const healthyRangeLabel = document.getElementById('bmiHealthyRange');
  const gaugeMarker = document.getElementById('bmiGaugeMarker');

  let activeUnit = 'metric';

  if (!tabMetric || !calcBtn) return;

  tabMetric.addEventListener('click', () => {
    activeUnit = 'metric';
    tabMetric.classList.add('active');
    tabImperial.classList.remove('active');
    metricFields.style.display = 'grid';
    imperialFields.style.display = 'none';
    calculateBMI();
  });

  tabImperial.addEventListener('click', () => {
    activeUnit = 'imperial';
    tabImperial.classList.add('active');
    tabMetric.classList.remove('active');
    metricFields.style.display = 'none';
    imperialFields.style.display = 'grid';
    calculateBMI();
  });

  function calculateBMI() {
    let bmi = 0;
    let minHealthyWeight = 0;
    let maxHealthyWeight = 0;
    let weightUnitStr = 'kg';

    if (activeUnit === 'metric') {
      const cm = parseFloat(heightCmInput.value);
      const kg = parseFloat(weightKgInput.value);

      if (isNaN(cm) || cm <= 40 || isNaN(kg) || kg <= 10) {
        window.showToast('Please enter realistic metric values for height and weight.', 'warning');
        return;
      }

      const meters = cm / 100;
      bmi = kg / (meters * meters);

      // Healthy range (18.5 - 24.9)
      minHealthyWeight = (18.5 * (meters * meters)).toFixed(1);
      maxHealthyWeight = (24.9 * (meters * meters)).toFixed(1);
      weightUnitStr = 'kg';
    } else {
      const feet = parseFloat(heightFeetInput.value) || 0;
      const inches = parseFloat(heightInchesInput.value) || 0;
      const lbs = parseFloat(weightLbsInput.value);

      const totalInches = (feet * 12) + inches;

      if (totalInches <= 20 || isNaN(lbs) || lbs <= 20) {
        window.showToast('Please enter realistic imperial values for height and weight.', 'warning');
        return;
      }

      bmi = (lbs / (totalInches * totalInches)) * 703;

      // Healthy range (18.5 - 24.9)
      minHealthyWeight = ((18.5 * (totalInches * totalInches)) / 703).toFixed(1);
      maxHealthyWeight = ((24.9 * (totalInches * totalInches)) / 703).toFixed(1);
      weightUnitStr = 'lbs';
    }

    const roundedBmi = parseFloat(bmi.toFixed(1));
    scoreLabel.textContent = roundedBmi.toString();

    // Determine Category
    let category = '';
    let categoryColor = '';
    let markerPercent = 0;

    if (roundedBmi < 18.5) {
      category = 'Underweight';
      categoryColor = '#3b82f6'; // Blue
      markerPercent = Math.max(5, (roundedBmi / 18.5) * 25);
    } else if (roundedBmi <= 24.9) {
      category = 'Normal Weight';
      categoryColor = '#10b981'; // Green
      markerPercent = 25 + (((roundedBmi - 18.5) / (24.9 - 18.5)) * 25);
    } else if (roundedBmi <= 29.9) {
      category = 'Overweight';
      categoryColor = '#f59e0b'; // Amber
      markerPercent = 50 + (((roundedBmi - 25) / (29.9 - 25)) * 25);
    } else {
      category = 'Obese';
      categoryColor = '#ef4444'; // Red
      markerPercent = Math.min(95, 75 + (((roundedBmi - 30) / 15) * 25));
    }

    categoryLabel.textContent = category;
    categoryLabel.style.backgroundColor = categoryColor;
    categoryLabel.style.color = '#ffffff';

    healthyRangeLabel.textContent = `${minHealthyWeight} – ${maxHealthyWeight} ${weightUnitStr}`;

    if (gaugeMarker) {
      gaugeMarker.style.left = `${markerPercent}%`;
    }
  }

  calcBtn.addEventListener('click', calculateBMI);

  [heightCmInput, weightKgInput, heightFeetInput, heightInchesInput, weightLbsInput].forEach(elem => {
    elem.addEventListener('change', calculateBMI);
  });

  // Calculate default
  calculateBMI();
})();
