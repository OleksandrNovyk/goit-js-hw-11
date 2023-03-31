import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { refs } from './js/refs';
import { fetchData } from './js/fetch';
import { notifySettings } from './js/notifySettings';
import { createMarkUp } from './js/createMarkUp';

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
refs.input.addEventListener('focus', onInputChange);

document.body.style.backgroundColor = "lightblue";

function onInputChange() {
  refs.searchSection.style.backgroundColor = 'hsla(248, 39%, 39%, 1)';
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  scrollZoom: false,
});

let searchQuery = null;
let pageStart = 1;

function onFormSubmit(event) {
  event.preventDefault();
  refs.searchSection.style.backgroundColor = 'hsla(248, 39%, 39%, 0.7)';
  searchQuery = event.currentTarget.elements.searchQuery.value;

  try {
    fetchData(searchQuery, pageStart).then(result => {
      const data = result.data;
      const total = data.totalHits;
      const picsArr = data.hits;
      const picsLeft = total - picsArr.length * pageStart;
      // console.log(picsLeft);

      if (searchQuery === '') {
        return Notify.warning(
          'Please enter key words for search.',
          notifySettings
        );
      }

      if (picsArr.length > 0) {
        Notify.success(`Hooray! We found ${total} images.`, notifySettings);
      }

      if (picsArr.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          notifySettings
        );
        refs.gallery.innerHTML = '';
        refs.loadMoreBtn.classList.add('is-hidden');
        return;
      }

      if (picsLeft > 0) {
        refs.loadMoreBtn.classList.remove('is-hidden');
      }

      refs.gallery.innerHTML = '';

      const markUp = createMarkUp(picsArr);
      refs.gallery.insertAdjacentHTML('beforeend', markUp);
      pageStart = pageStart + 1;
      lightbox.refresh();
    });
  } catch {
    er => {
      console.log(er);
    };
  }

  refs.form.reset();
}

function onLoadMoreBtnClick() {
  try {
    fetchData(searchQuery, pageStart).then(result => {
      const data = result.data;
      const total = data.totalHits;
      const picsArr = data.hits;
      const picsLeft = total - 40 * pageStart;
      // console.log(picsLeft);

      const markUp = createMarkUp(picsArr);
      refs.gallery.insertAdjacentHTML('beforeend', markUp);

      if (picsLeft <= 0) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notify.info(
          "We're sorry, but you've reached the end of search results.",
          notifySettings
        );
        pageStart = 1;
        return;
      }
      lightbox.refresh();
      pageStart = pageStart + 1;
    });
  } catch {
    er => {
      console.log(er);
    };
  }
}
