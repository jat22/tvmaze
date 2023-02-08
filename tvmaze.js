"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $searchQuery = $("#search-query")


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const showsFromSearch = await axios.get("https://api.tvmaze.com/search/shows", { params: {'q' : term} });
  return showsFromSearch.data
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  let img = ''
  for (let aShow of shows) {
    try{
      img = aShow.show.image.medium
    } catch(error){
      img = 'https://tinyurl.com/tv-missing'
    }
    const $show = $(
        `<div data-id="${aShow.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${img} 
              alt=${aShow.show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${aShow.show.name}</h5>
             <div><small>${aShow.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const searchTerm = $searchQuery.val();
  const shows = await getShowsByTerm(searchTerm);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`)
  const episodeArr = episodes.data.map(function(episode){
    return {
      id : episode.id,
      name : episode.name,
      season : episode.season,
      number : episode.number
    }
  })
  return episodeArr
}

async function searchForEpisodesAndDisplay(episodeId) {
  const episodes = await getEpisodesOfShow(episodeId)
  populateEpisodes(episodes)
}


$('#shows-list').on('click', async function (event){
  event.preventDefault();
  await searchForEpisodesAndDisplay(event.target.parentElement.parentElement.parentElement.dataset.id)
})

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  
  for (let anEpisode of episodes){
    const $episodeLi = $(
      `<li>${anEpisode.name} (Season ${anEpisode.season}, Episode ${anEpisode.number})</li>` 
      )
    $('#episodes-list').append($episodeLi)
  }
  $episodesArea.attr('style', '');
}
