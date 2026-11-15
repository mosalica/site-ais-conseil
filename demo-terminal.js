/* Camara Conseil — interactions de la page d'accueil (FR et EN).
   - Démo terminal : frappe en boucle, pastilles d'étapes synchronisées.
   - Compteurs du labo : animation à l'entrée dans l'écran.
   - Bande de mots-clés : surbrillance cyclique.
   Tout le contenu est présent dans le HTML : sans JavaScript, la transcription
   complète de la démo et les valeurs finales des compteurs restent visibles.
   Aucune requête réseau, aucune donnée envoyée. Les animations respectent
   « prefers-reduced-motion: reduce » (elles sont alors désactivées). */

(function () {
  "use strict";

  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var observe = "IntersectionObserver" in window;

  /* ---------- Démo terminal : frappe en boucle ---------- */
  var ecran = document.getElementById("terminal-ecran");
  if (ecran && !reduit && observe) {
    // La transcription est lue dans le HTML : une seule source de vérité.
    var lignes = ecran.textContent.replace(/\n+$/, "").split("\n");
    // data-etapes = index de la première ligne de chaque étape (0, 3, 4, 5).
    var debuts = (ecran.getAttribute("data-etapes") || "0")
      .split(",").map(function (n) { return parseInt(n, 10); });
    var pastilles = document.querySelectorAll(".demo-etapes li");
    var enCours = false;

    function etapePourLigne(i) {
      var e = 0;
      for (var k = 0; k < debuts.length; k++) { if (i >= debuts[k]) e = k; }
      return e;
    }

    function marquerEtapes(ligne) {
      var active = etapePourLigne(ligne);
      pastilles.forEach(function (li, idx) {
        li.classList.toggle("actif", idx === active);
        li.classList.toggle("fait", idx < active);
      });
    }

    function taper() {
      if (enCours) return;
      enCours = true;
      ecran.textContent = "";
      var li = 0, ci = 0;
      (function tick() {
        if (li >= lignes.length) {
          pastilles.forEach(function (el) {
            el.classList.remove("actif");
            el.classList.add("fait");
          });
          setTimeout(function () { enCours = false; taper(); }, 5000);
          return;
        }
        marquerEtapes(li);
        var ligne = lignes[li];
        if (ci < ligne.length) {
          ecran.textContent += ligne.charAt(ci);
          ci++;
          setTimeout(tick, 14);
        } else {
          ecran.textContent += "\n";
          li++;
          ci = 0;
          setTimeout(tick, 140);
        }
      })();
    }

    var ioTerminal = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          ioTerminal.disconnect();
          taper();
        }
      });
    }, { threshold: 0.25 });
    ioTerminal.observe(ecran);
  }

  /* ---------- Compteurs du labo ---------- */
  var compteurs = document.querySelectorAll(".compteur");
  if (compteurs.length && !reduit && observe) {
    var ioCompteurs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        var el = entree.target;
        ioCompteurs.unobserve(el);
        var cible = parseInt(el.getAttribute("data-cible"), 10);
        if (isNaN(cible)) return;
        var debut = null;
        var duree = 1200;
        function pas(ts) {
          if (debut === null) debut = ts;
          var p = Math.min((ts - debut) / duree, 1);
          el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(pas);
        }
        requestAnimationFrame(pas);
      });
    }, { threshold: 0.5 });
    compteurs.forEach(function (el) { ioCompteurs.observe(el); });
  }

  /* ---------- Bande de mots-clés : surbrillance cyclique ---------- */
  var mots = document.querySelectorAll(".bande-mots .mot");
  if (mots.length > 1 && !reduit) {
    var idx = 0;
    setInterval(function () {
      mots[idx].classList.remove("actif");
      idx = (idx + 1) % mots.length;
      mots[idx].classList.add("actif");
    }, 2600);
  }
})();
