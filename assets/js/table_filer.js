document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filterForm');
  const tableBody = document.getElementById('coursesTableBody');

  function getSelectedValues(prefix) {
    const allCheckbox = document.getElementById(prefix + 'All');
    if (allCheckbox.checked) return ['all'];

    const checked = [];
    filterForm.querySelectorAll(`input[type="checkbox"][id^="${prefix}"]:not(#${prefix}All)`).forEach(cb => {
      if (cb.checked) checked.push(cb.value);
    });

    // Если ничего не выбрано, считаем, что выбрано "all"
    return checked.length ? checked : ['all'];
  }

  function matchesFilter(value, selectedValues) {
    if (selectedValues.includes('all')) return true;
    return selectedValues.includes(value);
  }

  function matchesDuration(durationText, selectedDurations) {
    if (selectedDurations.includes('all')) return true;
    const hours = parseFloat(durationText);
    if (isNaN(hours)) return false;

    for (const dur of selectedDurations) {
      if (dur === 'short' && hours <= 5) return true;
      if (dur === 'medium' && hours > 5 && hours <= 20) return true;
      if (dur === 'long' && hours > 20) return true;
    }
    return false;
  }

  function updateAllCheckbox(prefix) {
    const allCheckbox = document.getElementById(prefix + 'All');
    const otherCheckboxes = Array.from(filterForm.querySelectorAll(`input[type="checkbox"][id^="${prefix}"]:not(#${prefix}All)`));

    const allChecked = otherCheckboxes.every(cb => cb.checked);
    const noneChecked = otherCheckboxes.every(cb => !cb.checked);

    // Если все остальные выбраны, снимаем "All"
    if (allChecked) {
      allCheckbox.checked = false;
    } 
    // Если никто не выбран, ставим "All"
    else if (noneChecked) {
      allCheckbox.checked = true;
    } 
    // Иначе "All" снимаем
    else {
      allCheckbox.checked = false;
    }
  }

  function onCheckboxChange(e) {
    const id = e.target.id;
    const prefix = id.match(/^(cat|dur|price)/)[0];
    const allCheckbox = document.getElementById(prefix + 'All');

    if (id === prefix + 'All') {
      // Если "All" выбран, снимаем остальные чекбоксы
      if (allCheckbox.checked) {
        filterForm.querySelectorAll(`input[type="checkbox"][id^="${prefix}"]:not(#${prefix}All)`).forEach(cb => cb.checked = false);
      }
    } else {
      // Если какой-то чекбокс выбран, снимаем "All"
      if (e.target.checked) {
        allCheckbox.checked = false;
      } else {
        // Если сняли чек, проверяем, все ли сняты
        const othersChecked = Array.from(filterForm.querySelectorAll(`input[type="checkbox"][id^="${prefix}"]:not(#${prefix}All)`)).some(cb => cb.checked);
        if (!othersChecked) {
          allCheckbox.checked = true;
        }
      }
    }

    // Обновим состояние "All" для всех групп (на всякий случай)
    ['cat', 'dur', 'price'].forEach(updateAllCheckbox);

    filterTable();
  }

  function filterTable() {
    const selectedCategories = getSelectedValues('cat');
    const selectedDurations = getSelectedValues('dur');
    const selectedPrices = getSelectedValues('price');

    Array.from(tableBody.rows).forEach(row => {
      const category = row.cells[1].textContent.trim();
      const duration = row.cells[2].textContent.trim();
      const price = row.cells[3].textContent.trim().toLowerCase();

      const categoryMatch = matchesFilter(category, selectedCategories);
      const durationMatch = matchesDuration(duration, selectedDurations);
      const priceMatch = matchesFilter(price, selectedPrices);

      row.style.display = (categoryMatch && durationMatch && priceMatch) ? '' : 'none';
    });
  }

  filterForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', onCheckboxChange);
  });

  // Инициализация фильтра при загрузке
  ['cat', 'dur', 'price'].forEach(updateAllCheckbox);
  filterTable();
});

