/* INFO This file is the mutations controller - ideally we want just one mutation observer per account's UI, which calls the various 'main()' fns */

let nuffieldUIobserverConfig = { subtree: true, childList: true };

function nuffieldUIobserverCallback(mutations) {
   for (let mutationRecord of mutations) {
      if (mutationRecord.target.id !== "data-table") continue;
      if (mutationRecord.addedNodes[0]?.nodeName !== "TBODY") continue;

      let studyRows = [...mutationRecord.addedNodes].filter(
         x => x.nodeName === "TBODY"
      );

      _relatedStudiesMain(studyRows);
   }
}

let nuffieldUIobserver = new MutationObserver(nuffieldUIobserverCallback);
nuffieldUIobserver.observe($("#data-table")[0], nuffieldUIobserverConfig);
