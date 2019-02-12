const MAXRESULT = 15;
function unify(e) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

let currentPositionX = null;

function lock(e) {
  currentPositionX = unify(e).clientX;
}
let countTranslate = 0;
function move(e) {
  const resultDiv2 = document.getElementsByClassName('article');

  const differentPositionX = unify(e).clientX - currentPositionX;
  const directionOfMove = Math.sign(differentPositionX);
  // eslint-disable-next-line max-len
  if ((countTranslate > 0 || directionOfMove < 0) && (countTranslate < 15 || directionOfMove > 0)) {
    for (let j = 0; j < MAXRESULT; j += 1) {
      resultDiv2[j].style.setProperty('--i', countTranslate - directionOfMove);
    }
    countTranslate -= directionOfMove;
  }
  currentPositionX = null;
}
function showTooltips() {
  const tooltips = document.createElement('div');
  tooltips.className = 'tooltips';

  for (let i = 0; i < 3; i += 1) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltipElement';
    const numberTooltip = document.createElement('span');
    numberTooltip.innerHTML = i + 1;
    tooltip.appendChild(numberTooltip);
    tooltips.appendChild(tooltip);
  }

  document.body.appendChild(tooltips);
  document.querySelector('.tooltipElement').className = 'tooltipCurrent';
}

function showVideos(data, dataStatistics) {
  const video = data;
  const videoStatistics = dataStatistics;
  const resultDiv = document.createElement('div');
  resultDiv.className = 'articles';

  if (video.items.length === 0) {
    const resultMessage = document.createElement('p');
    resultMessage.textContent = 'По Вашему запросу ничего не найдено';
    resultDiv.appendChild(resultMessage);
    document.body.appendChild(resultDiv);
  } else {
    for (let i = 0; i < MAXRESULT; i += 1) {
      const divArticle = document.createElement('div');
      divArticle.className = 'article';
      const articleTitle = document.createElement('p');
      const articleLink = document.createElement('a');
      articleLink.className = 'linkVideo';
      articleLink.style.backgroundImage = `url(${video.items[i].snippet.thumbnails.default.url})`;
      const articleDesc = document.createElement('p');
      const articleDatePublish = document.createElement('span');
      articleDatePublish.className = 'datePublish';
      const articleAuthor = document.createElement('span');
      articleAuthor.className = 'author';
      const countView = document.createElement('span');
      countView.className = 'countView';

      articleTitle.textContent = video.items[i].snippet.title;
      articleTitle.className = 'title';
      articleLink.href = `https://www.youtube.com/watch?v=${video.items[i].id.videoId}`;
      articleDesc.textContent = video.items[i].snippet.description;
      articleDesc.className = 'description';
      articleDatePublish.textContent = video.items[i].snippet.publishedAt.slice(0, 10);
      articleAuthor.textContent = video.items[i].snippet.channelTitle;
      countView.textContent = videoStatistics.items[i].statistics.viewCount;
      articleLink.appendChild(articleTitle);
      divArticle.appendChild(articleLink);
      divArticle.appendChild(articleAuthor);
      divArticle.appendChild(articleDatePublish);
      divArticle.appendChild(countView);
      divArticle.appendChild(articleDesc);
      resultDiv.appendChild(divArticle);
      document.body.appendChild(resultDiv);
    }
    showTooltips();
    resultDiv.addEventListener('mousedown', lock);
    resultDiv.addEventListener('touchstart', lock);
    resultDiv.addEventListener('mouseup', move);
    resultDiv.addEventListener('touchend', move);
    resultDiv.addEventListener('touchmove', (e) => { e.preventDefault(); }, false);
  }
}


function search() {
  if (document.querySelector('.articles') !== null) {
    document.querySelector('.articles').remove();
    document.querySelector('.tooltips').remove();
  }
  const searchValue = document.querySelector('.searchInput').value;
  const APIKEY = 'AIzaSyCttWdVyalxCfJCtGhTgRqpcxb_deqCruA';
  const url = `https://www.googleapis.com/youtube/v3/search?key=${APIKEY}&type=video&part=snippet&maxResults=${MAXRESULT}&q=${searchValue}`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function resp() {
    const result = JSON.parse(xhr.responseText);
    if (result.items.length !== 0) {
      const videosId = [];
      for (let i = 0; i < MAXRESULT; i += 1) {
        videosId.push(result.items[i].id.videoId);
      }
      videosId.join('');

      const urlStatistic = `https://www.googleapis.com/youtube/v3/videos?key=${APIKEY}&id=${videosId}&part=statistics`;
      const xhrStatistic = new XMLHttpRequest();
      xhrStatistic.open('GET', urlStatistic);
      xhrStatistic.onload = function resp2() {
        const resultStatistic = JSON.parse(xhrStatistic.responseText);
        showVideos(result, resultStatistic);
      };
      xhrStatistic.onerror = function onerr() {
        return (`Ошибка ${this.status}`);
      };
      xhrStatistic.send();
    } else {
      showVideos(result);
    }
  };
  xhr.onerror = function onerr() {
    return (`Ошибка ${this.status}`);
  };
  xhr.send();
}


window.onload = function start() {
  const searchDiv = document.createElement('div');
  searchDiv.className = 'search';
  const searchInput = document.createElement('input');
  searchInput.className = 'searchInput';
  searchInput.type = 'text';
  searchInput.value = '';
  searchInput.autofocus = 'true';
  searchInput.name = 'q';

  searchDiv.appendChild(searchInput);
  const buttonSubmit = document.createElement('button');
  buttonSubmit.className = 'searchSubmitButton';
  buttonSubmit.innerHTML = 'Search';
  searchDiv.appendChild(buttonSubmit);
  document.body.appendChild(searchDiv);
  buttonSubmit.addEventListener('click', search);
  searchInput.addEventListener('focus', function focus() { searchInput.value = ''; });
};
