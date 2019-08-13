/* base DOM interaction and abstraction */
class UiComponent {
  byId(id) {
    return document.getElementById(id);
  }
  replace(id, content) {
    let processed = content;

    if (content instanceof HTMLUListElement) {
      processed = content.innerHTML;
    }

    this.byId(id).innerHTML = processed;
  }
  add(root, el) {
    root.append(el);
    return root;
  }
  swapClass(el, className) {
    const parent = el.parentElement,
          children = Array.from(el.parentElement.children),
          regexp = new RegExp(className),
          elClasses = el.className.split(' ');

    children.forEach(child => {
      if(regexp.test(child.className)) {
        child.className = this._processClass(child, className);
      }
    });
    elClasses.push(className);
    el.className+= elClasses.join(' ');
  }
  _processClass(el, className) {
    const classes = el.className.split(' ');
    classes.splice(classes.indexOf(className), 1);
    return classes.join(' ');
  }
  create(type = 'div', text = '') {
    const newEl = document.createElement(type);
    newEl.innerText = text;
    return newEl;
  }
}

class Calendar extends UiComponent {
  constructor() {
    super();
  }
  init(cfg = this.cfg) {
    const now = new Date();

    this.cfg = cfg;
    this.currMonth = now.getMonth();
    this.currYear = now.getYear();

    this.byId('calendar-previous')
        .addEventListener('click', this.previous.bind(this));
    this.byId('calendar-next')
        .addEventListener('click', this.next.bind(this));
    this.buildDaysOfWeek();
    this.buildCalendar();
  }
  buildCalendar() {
    const content = `${this.cfg.MONTHS[this.currMonth]} ${this.currYear}`;
    this.replace('component-header-content', content);
    this.buildMonth();
  }
  startOfMonth(month = this.currMonth) {
    return new Date(this.currYear, this.currMonth, 1).getDay();
  }
  lastDayOfMonth() {
    return new Date(this.currYear, this.currMonth + 1, 0).getDate();
  }
  previous() {
    if (this.currMonth === 0) {
      this.currMonth = 11;
      this.currYear--;
    } else {
      this.currMonth--;
    }
    this.buildCalendar();
  }
  next() {
    if (this.currMonth === this.cfg.MONTHS.length - 1) {
      this.currMonth = 0;
      this.currYear++;
    } else {
      this.currMonth++;
    }
    this.buildCalendar();
  }
  buildDaysOfWeek() {
    const section = this.create('ul');
    this.cfg.DAYSOFWEEK.forEach(day => {
      this.add(section, this.create('li', day));
    });
    this.replace('weekdays', section);
  }
  buildMonth() {
    const section = this.create('ul');

    // build start of month offset
    for (let i = 0; i < this.startOfMonth(); i++) {
      this.add(section, this.create('li'));
    }

    // fill out the days of the month
    for (let i = 1; i <= this.lastDayOfMonth(); i++) {
      this.add(section, this.create('li', i));
    }

    this.byId('month').innerHTML = '';
    this.add(this.byId('month'), section);
  }
  get currMonth() {
    return this._currMonth;
  }
  get currYear() {
    return this._currYear;
  }
  set currYear(year) {
    this._currYear = year;
    if (this._currYear < 1000) {
      this._currYear+= 1900;
    }
    return this;
  }
  set currMonth(month) {
    this._currMonth = month;
    return this;
  }
}

class Application extends Calendar {
  constructor(cfg) {
    super();

    this.byId('app-footer').addEventListener('click', this.changeLocale.bind(this));

    this.init(cfg);
  }
  changeLocale(event) {
    if(event.target && event.target.nodeName == "IMG") {
      this.swapClass(event.target.parentElement, 'active');
      this.init(getLocalizedConfig(event.target.dataset.locale));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Application(getLocalizedConfig(navigator.language));
});

function getLocalizedConfig(locale = 'en') {
  const MONTHS = [], DAYSOFWEEK = [];

  for (let i = 1;i<=12;i++) {
    const month = new Date(2018, i, 0),
          weekday = new Date(1970, 1, i);

    if (i <= 7) {
      DAYSOFWEEK.push(weekday.toLocaleString(locale, { weekday: "short" }));
    }

    MONTHS.push(month.toLocaleString(locale, { month: "short" }));
  }
  return { MONTHS, DAYSOFWEEK };
}
