"use strict";
var CACHE = "timeplanner-shell-v1";
var CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];
self.addEventListener("install", function(event){
  event.waitUntil(caches.open(CACHE).then(function(cache){
    return Promise.all(CORE.map(function(url){ return cache.add(url).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(key){ return key.indexOf("timeplanner-shell-")===0 && key!==CACHE; }).map(function(key){ return caches.delete(key); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(event){
  var request=event.request;
  if(request.method!=="GET" || new URL(request.url).origin!==self.location.origin) return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(function(response){
      var copy=response.clone(); caches.open(CACHE).then(function(cache){cache.put(request,copy);}); return response;
    }).catch(function(){return caches.match(request).then(function(hit){return hit||caches.match("./index.html");});}));
    return;
  }
  event.respondWith(caches.match(request).then(function(hit){
    if(hit) return hit;
    return fetch(request).then(function(response){
      if(response && response.ok){var copy=response.clone();caches.open(CACHE).then(function(cache){cache.put(request,copy);});}
      return response;
    });
  }));
});
