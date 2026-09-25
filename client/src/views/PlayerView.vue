<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, getfileUrl } from '../api'
import { configState } from '../configStore'
import { formatSearchQueryUrl } from '../utils/format'
import HintsPanel from '../components/HintsPanel.vue'
import googleLogoUrl from '../assets/Google_logo.svg'
import spotifyLogoUrl from '../assets/Spotify_icon.svg'
import tidalLogoUrl from '../assets/Tidal_logo.svg'
import youtubeLogoUrl from '../assets/YouTube_logo.svg'
import youtubeMusicLogoUrl from '../assets/YouTube_Music_logo.svg'
import appleLogoUrl from '../assets/Apple_logo.svg'
import amazonLogoUrl from '../assets/Amazon_logo.svg'
import deezerLogoUrl from '../assets/Deezer_logo.svg'
import bandcampLogoUrl from '../assets/Bandcamp_logo.svg'
import discogsLogoUrl from '../assets/Discogs_logo.svg'
import musicBrainzLogoUrl from '../assets/MusicBrainz_logo.svg'
import wikipediaLogoUrl from '../assets/Wikipedia_logo.svg'
import soundcloudLogoUrl from '../assets/SoundCloud_logo.svg'
import mp3LogoUrl from '../assets/mp3_logo.svg'
import lastFmLogoUrl from '../assets/Lastfm_logo.svg'
import type { TrackInfo } from '../types'

/**
 * Port of player.html, including its inline jQuery script.
 *
 * Behavior: shows a random track matching the query-string filters; when local
 * playback is enabled, streams the file via /getfile and auto-advances to the
 * next random track when playback ends. With ?hints=1 ("name that tune"),
 * track details and cover are hidden until the user reveals them.
 */
const route = useRoute()

const track = ref<TrackInfo | null>(null)
const error = ref<string | null>(null)
const isPlaying = ref(false)
/** Set when the next loaded track should start playing as soon as it can. */
const autoplayPending = ref(false)
/** "name that tune": details/cover stay hidden until Show Details is clicked. */
const hintsRevealed = ref(false)

const audioRef = ref<HTMLAudioElement | null>(null)

const localEnabled = computed(() => configState.config?.playbackMethodLocalEnabled ?? false)
const hintsMode = computed(() => route.query.hints === '1')

async function loadTrack(autoplay = false): Promise<void> {
  error.value = null
  hintsRevealed.value = false
  autoplayPending.value = autoplay
  try {
    track.value = await api.randomTrack(route.query)
  } catch (e) {
    track.value = null
    error.value = `Failed to load track(s). ${e instanceof Error ? e.message : String(e)}`
  }
}

watch(() => route.query, () => loadTrack(false), { immediate: true })

const audioSrc = computed(() =>
  track.value && localEnabled.value ? getfileUrl(track.value.path) : undefined,
)
const coverSrc = computed(() => (track.value ? getfileUrl(track.value.coverPath) : '#'))

/** Links into the browse pages for the current track. */
const trackLinks = computed(() => {
  const t = track.value
  if (!t) return null
  return {
    album: { path: '/tracks', query: { artist: t.artist, album: t.album } },
    artist: { path: '/albums', query: { artist: t.artist } },
    city: { path: '/artists', query: { city: t.city, countryCode: t.countryCode } },
    language: { path: '/artists', query: { languageCode: t.languageCode } },
    country: { path: '/artists', query: { countryCode: t.countryCode } },
    genre: { path: '/genre', query: { genre: t.genre } },
    region: { path: '/artists', query: { regionCode: t.regionCode } },
    year: { path: '/albums', query: { year: String(t.year) } },
    playLocal: {
      path: '/player',
      query: { artist: t.artist, album: t.album, title: t.title },
    },
  }
})

interface WebSearchLink {
  name: string
  url: string
}

const webSearchLinks = computed<WebSearchLink[]>(() => {
  const t = track.value
  const methods = configState.config?.webSearchPlaybackMethods ?? []
  if (!t) return []
  return methods.map((m) => ({
    name: m.name,
    url: formatSearchQueryUrl(m.searchQueryUrlFormat, t.artist, t.album, t.title),
  }))
})

function togglePlayback(): void {
  const audio = audioRef.value
  if (!audio) return
  if (audio.paused) {
    void audio.play()
  } else {
    audio.pause()
  }
}

function restart(): void {
  const audio = audioRef.value
  if (!audio) return
  audio.currentTime = 0
  if (audio.paused) {
    void audio.play()
  }
}

function next(): void {
  void loadTrack(localEnabled.value)
}

function isGoogleLink(url: string): boolean {
  return url.toLowerCase().includes('google.com') && !url.toLowerCase().includes('q=spotify:search') && !url.toLowerCase().includes('q=tidal:search')
}

function isSpotifyLink(url: string): boolean {
  return url.toLowerCase().includes('spotify.com') || url.toLowerCase().includes('q=spotify:search')
}

function isAppleLink(url: string): boolean {
  return url.toLowerCase().includes('apple.com')
}

function isAmazonLink(url: string): boolean {
  return url.toLowerCase().includes('amazon.com')
}

function isTidalLink(url: string): boolean {
  return url.toLowerCase().includes('tidal.com') || url.toLowerCase().includes('q=tidal:search')
}

function isYoutubeLink(url: string): boolean {
  return url.toLowerCase().includes('youtube.com') && !url.toLowerCase().includes('music.youtube.com')
}

function isYoutubeMusicLink(url: string): boolean {
  return url.toLowerCase().includes('music.youtube.com')
}

function isDeezerLink(url: string): boolean {
  return url.toLowerCase().includes('deezer.com')
}

function isDiscogsLink(url: string): boolean {
  return url.toLowerCase().includes('discogs.com')
}

function isBandcampLink(url: string): boolean {
  return url.toLowerCase().includes('bandcamp.com')
}

function isMusicBrainzLink(url: string): boolean {
  return url.toLowerCase().includes('musicbrainz.org')
}

function isWikipediaLink(url: string): boolean {
  return url.toLowerCase().includes('wikipedia.org')
}

function isSoundcloudLink(url: string): boolean {
  return url.toLowerCase().includes('soundcloud.com')
}

function isLastFmLink(url: string): boolean {
  return url.toLowerCase().includes('last.fm')
}

/** Continuous shuffle: when a track ends, load the next one and play it. */
function onEnded(): void {
  void loadTrack(true)
}

function onCanPlayThrough(): void {
  const audio = audioRef.value
  if (audio && autoplayPending.value && audio.paused) {
    autoplayPending.value = false
    void audio.play()
  }
}
</script>

<template>
  <div>
    <div v-show="!hintsMode || hintsRevealed" id="cover">
      <router-link v-if="trackLinks" :to="trackLinks.album" target="_blank" rel="noopener noreferrer">
        <img :src="coverSrc" id="coverImg" class="cover-img single-img" width="1000" height="1000" />
      </router-link>
    </div>
    <div id="playerControls">
      <template v-if="localEnabled">
        <h1 v-if="hintsMode">Random track, can you name it?</h1>
        <button id="restartBtn" class="player-btn btn btn-secondary btn-lg" @click="restart">
          <i class="bi bi-arrow-clockwise"></i> Restart
        </button>
        <button id="playBtn" class="player-btn btn btn-secondary btn-lg play-button-xl" @click="togglePlayback">
          <template v-if="isPlaying"><i class="bi bi-pause-circle-fill"></i> Pause</template>
          <template v-else><i class="bi bi-play-circle-fill"></i> Play</template>
        </button>
      </template>
      <button id="nextBtn" class="player-btn btn btn-secondary btn-lg" @click="next">
        <i class="bi bi-fast-forward-circle-fill"></i> Next
      </button>
      <br />
      <HintsPanel
        v-if="localEnabled && hintsMode"
        :track="track"
        @reveal="hintsRevealed = true"
      />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-show="!hintsMode || hintsRevealed" id="trackList">
      <div v-if="track && trackLinks" class="playback-options-ribbon">
        <router-link
          v-if="localEnabled"
          id="playLocalMediaLink"
          class="playback-option"
          :to="trackLinks.playLocal"
          ><img :src="mp3LogoUrl" class="playback-link-icon" alt="" />Local Media</router-link
        >
        <a
          v-for="link in webSearchLinks"
          :key="link.name"
          class="playback-option"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img v-if="isGoogleLink(link.url)" :src="googleLogoUrl" class="playback-link-icon" alt="" />
          <img
            v-else-if="isSpotifyLink(link.url)"
            :src="spotifyLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isTidalLink(link.url)"
            :src="tidalLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isYoutubeLink(link.url)"
            :src="youtubeLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isYoutubeMusicLink(link.url)"
            :src="youtubeMusicLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isAppleLink(link.url)"
            :src="appleLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isAmazonLink(link.url)"
            :src="amazonLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isDeezerLink(link.url)"
            :src="deezerLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isDiscogsLink(link.url)"
            :src="discogsLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isBandcampLink(link.url)"
            :src="bandcampLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isMusicBrainzLink(link.url)"
            :src="musicBrainzLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isWikipediaLink(link.url)"
            :src="wikipediaLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isSoundcloudLink(link.url)"
            :src="soundcloudLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <img
            v-else-if="isLastFmLink(link.url)"
            :src="lastFmLogoUrl"
            class="playback-link-icon"
            alt=""
          />
          <template v-else>🔍</template
          >{{ link.name }}
        </a>
      </div>
      <table v-if="track && trackLinks" class="playback-options track-info">
        <tr>
          <th>Title:</th>
          <td>
            <a id="linkTitle" href="#" @click.prevent="togglePlayback">{{ track.title }}</a>
          </td>
        </tr>
        <tr>
          <th>Artist:</th>
          <td>
            <router-link id="linkArtist" :to="trackLinks.artist" target="_blank" rel="noopener noreferrer">{{
              track.artist
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Album:</th>
          <td>
            <router-link id="linkAlbum" :to="trackLinks.album" target="_blank" rel="noopener noreferrer">{{
              track.album
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Genre:</th>
          <td>
            <router-link id="linkGenre" :to="trackLinks.genre" target="_blank" rel="noopener noreferrer">{{
              track.genre
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Year:</th>
          <td>
            <router-link id="linkYear" :to="trackLinks.year" target="_blank" rel="noopener noreferrer">{{
              track.year
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Country:</th>
          <td>
            <router-link id="linkCountry" :to="trackLinks.country" target="_blank" rel="noopener noreferrer">{{
              track.countryCode
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Region:</th>
          <td>
            <router-link id="linkRegion" :to="trackLinks.region" target="_blank" rel="noopener noreferrer">{{
              track.regionCode
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>City:</th>
          <td>
            <router-link id="linkCity" :to="trackLinks.city" target="_blank" rel="noopener noreferrer">{{
              track.city
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Language:</th>
          <td>
            <router-link id="linkLanguage" :to="trackLinks.language" target="_blank" rel="noopener noreferrer">{{
              track.languageCode
            }}</router-link>
          </td>
        </tr>
      </table>
    </div>

    <audio
      v-if="localEnabled"
      ref="audioRef"
      id="audioElem"
      class="full"
      controls
      :src="audioSrc"
      @ended="onEnded"
      @canplaythrough="onCanPlayThrough"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    >
      Your browser does not support the audio element.
    </audio>
  </div>
</template>
