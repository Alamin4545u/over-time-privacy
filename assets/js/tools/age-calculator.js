/**
 * Nexora Tools - Age Calculator
 * 100% Client-Side chronological date calculations
 */

document.addEventListener('DOMContentLoaded', () => {
  const birthdateInput = document.getElementById('birthdate-input');
  const targetDateInput = document.getElementById('targetdate-input');
  const calculateBtn = document.getElementById('calculate-age-btn');
  const todayBtn = document.getElementById('today-btn');
  const ageResults = document.getElementById('age-results');

  // Result displays
  const yearsVal = document.getElementById('years-val');
  const monthsVal = document.getElementById('months-val');
  const daysVal = document.getElementById('days-val');
  const nextBirthdayVal = document.getElementById('next-bday-val');
  const nextBirthdayWeekday = document.getElementById('next-bday-weekday');
  const zodiacVal = document.getElementById('zodiac-val');
  const totalMonthsVal = document.getElementById('total-months-val');
  const totalWeeksVal = document.getElementById('total-weeks-val');
  const totalDaysVal = document.getElementById('total-days-val');
  const totalHoursVal = document.getElementById('total-hours-val');
  const totalMinutesVal = document.getElementById('total-minutes-val');

  // Set default target date to today
  const today = new Date();
  const formatYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  targetDateInput.value = formatYMD(today);

  // Set sample birthdate
  const sampleBirth = new Date(today.getFullYear() - 25, 5, 15);
  birthdateInput.value = formatYMD(sampleBirth);

  todayBtn.addEventListener('click', () => {
    targetDateInput.value = formatYMD(new Date());
    calculateAge();
  });

  calculateBtn.addEventListener('click', calculateAge);
  birthdateInput.addEventListener('change', calculateAge);
  targetDateInput.addEventListener('change', calculateAge);

  function getZodiacSign(day, month) {
    // month is 1-12
    const signs = [
      { name: 'Capricorn ♑', endDay: 19 },
      { name: 'Aquarius ♒', endDay: 18 },
      { name: 'Pisces ♓', endDay: 20 },
      { name: 'Aries ♈', endDay: 19 },
      { name: 'Taurus ♉', endDay: 20 },
      { name: 'Gemini ♊', endDay: 20 },
      { name: 'Cancer ♋', endDay: 22 },
      { name: 'Leo ♌', endDay: 22 },
      { name: 'Virgo ♍', endDay: 22 },
      { name: 'Libra ♎', endDay: 22 },
      { name: 'Scorpio ♏', endDay: 21 },
      { name: 'Sagittarius ♐', endDay: 21 },
      { name: 'Capricorn ♑', endDay: 31 }
    ];
    return day <= signs[month - 1].endDay ? signs[month - 1].name : signs[month].name;
  }

  function calculateAge() {
    const birthVal = birthdateInput.value;
    const targetVal = targetDateInput.value;

    if (!birthVal || !targetVal) {
      if (window.NexoraApp) window.NexoraApp.showToast('Please select both dates');
      return;
    }

    const birthDate = new Date(birthVal + 'T00:00:00');
    const targetDate = new Date(targetVal + 'T00:00:00');

    if (birthDate > targetDate) {
      if (window.NexoraApp) window.NexoraApp.showToast('Birth date cannot be after target date');
      return;
    }

    let bYear = birthDate.getFullYear();
    let bMonth = birthDate.getMonth();
    let bDay = birthDate.getDate();

    let tYear = targetDate.getFullYear();
    let tMonth = targetDate.getMonth();
    let tDay = targetDate.getDate();

    let years = tYear - bYear;
    let months = tMonth - bMonth;
    let days = tDay - bDay;

    if (days < 0) {
      // borrow days from previous month
      months--;
      const prevMonthDays = new Date(tYear, tMonth, 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    yearsVal.textContent = years;
    monthsVal.textContent = months;
    daysVal.textContent = days;

    // Calculate Next Birthday
    let nextBdayYear = tYear;
    let nextBday = new Date(nextBdayYear, bMonth, bDay);
    if (nextBday < targetDate) {
      nextBdayYear++;
      nextBday = new Date(nextBdayYear, bMonth, bDay);
    }

    const diffMsNext = nextBday.getTime() - targetDate.getTime();
    const daysUntilNextBday = Math.ceil(diffMsNext / (1000 * 60 * 60 * 24));
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextWeekday = weekdays[nextBday.getDay()];

    if (daysUntilNextBday === 0) {
      nextBirthdayVal.textContent = 'Today! 🎉';
      nextBirthdayWeekday.textContent = `Happy Birthday!`;
    } else {
      nextBirthdayVal.textContent = `${daysUntilNextBday} Days`;
      nextBirthdayWeekday.textContent = `Falls on a ${nextWeekday}`;
    }

    // Astrological Zodiac
    zodiacVal.textContent = getZodiacSign(bDay, bMonth + 1);

    // Total units
    const totalMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const approxMonths = (years * 12) + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    totalMonthsVal.textContent = approxMonths.toLocaleString();
    totalWeeksVal.textContent = `${totalWeeks.toLocaleString()} weeks, ${remainingDays} days`;
    totalDaysVal.textContent = totalDays.toLocaleString();
    totalHoursVal.textContent = totalHours.toLocaleString();
    totalMinutesVal.textContent = totalMinutes.toLocaleString();

    ageResults.classList.remove('hidden');
  }

  // Initial calculation
  calculateAge();
});
