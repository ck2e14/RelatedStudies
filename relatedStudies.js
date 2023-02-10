"use strict";

// Templating
let {
   spinner,
   reportLinkEl,
   relatedTemplate,
   hl7ReportLinkEl,
   linksArrayToHTMLstr,
   reportsModalTemplate,
} = {
   relatedTemplate: function (clickedStudyID, metadata) {
      let {
         storage_namespace,
         study_uid,
         accession_number,
         modality,
         attachment_count,
         phi_namespace,
         patient_name,
         study_date,
         created,
         customfields,
         study_status,
         first_name,
         uuid,
         thin,
         study_description,
         hl7,
      } = metadata || "";

      let reportsCount = attachment_count + hl7.length;

      let template = `
         <tbody 
            id='related-appended-${uuid}'
            class='related-appended related-appended-for-${clickedStudyID}'
            data-dicomgrid-study-uuid="${uuid}" 
            data-dicomgrid-engine-fqdn="storelpu.cimar.co.uk"
            data-dicomgrid-storage-namespace="${storage_namespace}"
            data-dicomgrid-study-uid="${study_uid}"
            data-dicomgrid-phi-namespace="${phi_namespace}"
            data-dicomgrid-study-patient-name="${patient_name}"
            data-dicomgrid-modality="${modality}">
               <tr
                  valign="top"
                  data-dicomgrid-study-uuid="${uuid}"
                  data-dicomgrid-engine-fqdn="storelpu.cimar.co.uk"
                  data-dicomgrid-storage-namespace="${storage_namespace}"
                  data-dicomgrid-study-uid="${study_uid}"
                  data-dicomgrid-phi-namespace="${phi_namespace}"
                  data-dicomgrid-study-patient-name="${patient_name}"
                  data-dicomgrid-modality="${modality}"
                  class="sort sortables simplified">
                  
                     <td></td>
                     
                     <td>
                        <span 
                           class='label related-label' 
                           rel="tooltip" 
                           data-original-title="Patient">
                              ${first_name}
                        </span>
                        <span data-dicomgrid-tag="AccessionNumber" data-dicomgrid-size="span2">
                           <a
                              class="label related-label"
                              data-dicomgrid-display-name="Accession"
                              rel="tooltip" 
                              data-original-title="Accession">
                                 ${accession_number}
                           </a>
                        </span>
                     </td>

                     <td>
                        ${
                           thin
                              ? `<span class='label label-info thin-study' data-i18n-token='study:thin'>THIN</span>`
                              : ""
                        }
                        <strong
                           class="upper"
                           data-dicomgrid-tag="StudyDescription"
                           data-dicomgrid-size="span3"
                           rel="tooltip" 
                           data-original-title="Description">
                              ${study_description || "No Description"}
                        </strong>
                        <span class='label' data-dicomgrid-tag="Modality" rel="tooltip" data-original-title="Modality">
                           (${modality})
                        </span>
                        <span class='related-site-name'>&nbsp;&nbsp; 
                        ${
                           getSiteNameCF(customfields)
                              ? "(" + getSiteNameCF(customfields) + ")"
                              : ""
                        }
                        </span>
                     </td>

                     <td class="datetime">
                        <span class="primary-info" rel="tooltip" data-original-title="Study Date">
                           ${formatDateStr(study_date)}
                        </span>
                     </td>

                     <td class="datetime">
                        <span data-dicomgrid-tag="StudyCreateDate" rel="tooltip" data-original-title="Uploaded Date">
                           ${created.split(" ")[0]}</span>
                        </span>
                     </td>

                     <td class="row-actions study" data-related-reports-count="${reportsCount}">
                        <div class="btn-group" style="transform: scale(1)";>
                           <div class="btn-group">
                        ${
                           !thin
                              ? `
                              <button
                                 type="button"
                                 class="btn btn-default btn-sm btn-fa-icon view"
                                 data-i18n-token="global:view-study-viewer"
                                 data-dicomgrid-action-click="browse-study-new-tab"
                                 rel="tooltip"
                                 data-container="body"
                                 data-original-title="View study in viewer">
                                 <i class="far fa-skeleton"></i>
                              </button>
                              <div
                                 class="btn-fa-icon btn-fa-icon-label"
                                 data-dicomgrid-action-click="browse-study-new-tab"
                                 data-i18n-token="global:images">
                              </div>`
                              : `
                              <button 
                                 type="button" 
                                 class="btn btn-default btn-sm btn-fa-icon" 
                                 style="transform: scale(0.8)"
                                 data-dicomgrid-action-click="retrieve-thin-study" 
                                 rel="tooltip" 
                                 data-container="body" 
                                 data-original-title="Retrieve from Nuffield PACS">
                                    <i class="far fa-share fa-flip-horizontal"></i>
                              </button>`
                        }
                           </div>
                        </div>

                        <div class="btn-group" data-related-reports-count="${reportsCount}">
                           <button 
                              onClick="reportsClickHandler(event)"
                              rel="tooltip"
                              data-original-title="${
                                 reportsCount === 1
                                    ? `${reportsCount} Report`
                                    : `${reportsCount} Reports`
                              }" 
                              class="btn btn-default btn-sm btn-fa-icon"
                              style="position: relative; transform: scale(1.5)"
                              id="additional-${uuid}"
                              data-related-reports-count="${reportsCount}"
                              data-dicomgrid-popover-align="right"
                              data-dicomgrid-popover-template="study-reports-template">
                                 <span 
                                    class="fa fa-file attachment-count"
                                    onClick="reportsClickHandler(event)"
                                    data-related-reports-count="${reportsCount}">
                                 </span>
                                 <span 
                                    className="ck-font make-subscript" 
                                    data-related-reports-count="${reportsCount}"
                                    style="font-size: .8rem;"
                                    onClick="reportsClickHandler(event)">
                                       ${reportsCount}
                                 </span>
                           </button>
                        </div>
                  
                        <div class="btn-group pull-right" data-dicomgrid-status=${study_status}">
                           <button
                              class="btn-sm btn-fa-icon"
                              rel="tooltip"
                              title="Study stage"
                              data-container="body">
                                 <div>
                                    <span class="study-status" id="study-status-tag-${uuid}" data-dicomgrid-status="${study_status}">
                                       ${study_status}
                                    </span>
                                 </div>
                           </button>
                        </div>
                     </td>
               </tr>
         </tbody>`;

      return template;
   },

   reportsModalTemplate: function (studyID) {
      let { AccessionNumber } = getStudyData(studyID);
      print(AccessionNumber);

      let closeBtn = `<div class="close-report-button" onClick="closeReportsModal(event)" rel="tooltip" title="Close">x</div>`;
      let modalHtml = `<div  
                           class="reports-modal flex-col-top-left fade-into-dimmed" 
                           id="related-reports-modal-${studyID}"
                           onMouseEnter="onReportsModalMouseHandler(event)" 
                           onMouseLeave="onReportsModalMouseHandler(event)">

                              <span class="reports-modal-title">
                                 ${AccessionNumber}
                              </span>

                              ${closeBtn}
                              
                              <div class=" fade-in reports-spinner-wrapper flex-col-center-center">
                                 <div id="reports-spinner-${studyID}" class="lds-dual-ring-larger"></div>
                              </div>
                       </div>`;

      return modalHtml;
   },

   linksArrayToHTMLstr: function (contentArray) {
      return contentArray.reduce((a, b) => a + b + "\n", ``);
   },

   spinner: function (studyID, elID = `spinner-${studyID}`) {
      return `<div id="${elID}" class="lds-dual-ring"></div>`;
   },

   hl7ReportLinkEl: function (hl7ID, studyID) {
      return `<a 
                  target="_blank" 
                  class="fade-in related-reports-report-link" 
                  rel=”noopener noreferrer”  
                  href="https://nuffieldhealth.cimar.co.uk/report.html?uuid=${hl7ID}&study_uuid=${studyID}&sid=${getSid()}">
                     HL7 Report  ↗
             </a>`;
   },

   reportLinkEl: function (
      { id: attachmentID, filename, version, stored }, //  { schema.attachment }
      phi_namespace, // other args need to come separately because they're in the parent obj to the arg1 attachment
      storage_namespace,
      study_uid
   ) {
      let href =
         `/host/storelpu.cimar.co.uk/api/v3/storage/study/` +
         `${storage_namespace}/${study_uid}/attachment/${attachmentID}` +
         `/version/${version}/${encodeURIComponent(filename)}` +
         `?phi_namespace=${phi_namespace}&sid=${getSid()}${darkHTML()}`;

      return `<a 
                class="fade-in related-reports-report-link" 
                target="_blank" 
                rel=”noopener noreferrer” 
                href=${href}>
                   ${filename} ↗ <br>
                   ${unixToDate()}
              </a>`;
   },
};

// Utility Functions
let {
   print,
   pause,
   getSid,
   getStudyData,
   formatDateStr,
   getSiteNameCF,
   closeReportsModal,
   uuidFromRowChildren,
   darkHTML,
   unixToDate,
} = {
   pause: async seconds => new Promise(res => setTimeout(res, seconds * 1000)),

   getSid: () => window.sessionStorage.sid,

   unixToDate: timestamp => new Date(timestamp).toLocaleDateString("en-GB"),

   formatDateStr: function (date) {
      let x = date.split("");

      x.splice(4, 0, "-");
      x.splice(7, 0, "-");

      return x.join("");
   },

   getSiteNameCF: function (cfs) {
      for (let cf of cfs) {
         if (cf.name === "CRIS Site Code") return cf.value;
      }
   },

   closeReportsModal: function (event) {
      event.stopPropagation();
      $(`#related-reports-modal-${uuidFromRowChildren(event.target)}`).remove();
   },

   uuidFromRowChildren: function (element) {
      return $(element).parents("tbody").attr("data-dicomgrid-study-uuid");
   },

   getStudyData: DG.ActionHelpers.getStudyInformation,

   print: console.log,

   darkHTML: () => (DG.User.isDarkModeEnabled() ? "#dark" : ""),
};

// Rendering
let {
   renderRelatedCTAs,
   renderMRNSpinner,
   renderStylesheet,
   renderRelatedRow,
} = {
   renderRelatedRow: async function (
      clickedStudy,
      clickedStudyID,
      currentPhiNS,
      relateds
   ) {
      let uniques = new Set();

      for (let metadata of relateds) {
         if (uniques.has(metadata.study_uid)) continue;
         uniques.add(metadata.study_uid);
         $(relatedTemplate(clickedStudyID, metadata, currentPhiNS))
            .insertAfter(clickedStudy)
            .hide()
            .fadeIn();
      }
   },

   renderRelatedCTAs: function (studyRows) {
      let src =
         "https://www.cimar.co.uk/wp-content/uploads/2022/10/link-icon.svg";

      renderLoop: for (let row of studyRows) {
         let btn = document.createElement("img");
         btn = $('<i class="fa fa-user"></i>')[0];

         btn.src = src;
         btn.classList.add("related-btn");

         $(btn).attr("rel", "tooltip");
         $(btn).attr("data-original-title", "View related");
         $(btn).click(event => relatedStudiesClickHandler(event));
         $(row).find(".study-actions")[0]?.prepend(btn);
      }
   },

   renderMRNSpinner: function (appendTarget, clickedStudyID) {
      let elID = `spinner-${clickedStudyID}`;
      $(appendTarget)
         .find(`[data-dicomgrid-display-name="MRN"]`)[0]
         .insertAdjacentHTML("afterend", spinner(clickedStudyID, elID));
      return elID;
   },

   renderStylesheet: function () {
      let stylesheet = document.createElement("style");

      stylesheet.innerHTML = `
         .flex-col-center-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: left;
         }

         .flex-col-top-left {
            display: flex;
            flex-direction: column;
            justify-content: top;
            align-items: left;
         }

         .flex-col-center-center {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
         }

         .related-label {
            font-size: 1.25rem !important;
         }

         .related-appended {
            transition: height .25s;
            height: 65px;
         }

         .reports-modal a {
            font-size 2.25rem !important;
            transition: color .25s;
         }

          .reports-modal a:hover {
            color: #b5b5b5 !important;
          }

         .related-appended * {
            vertical-align: middle !important;
            color: #6f6f6f !important;
         }

         .reports-modal-title {
            font-size: 2.5rem !important;
            border-bottom: 1px solid gray;
            margin-bottom: 5%;
            color: #b5b5b5 !important;
         }

         .reports-modal {
            height: fit-content;
            min-height: 200px;
            width: fit-content;
            max-width: 1200px;
            min-width: 250px;
            padding: 1rem;
            background: #333;
            border: 1px solid #464545;
            border-radius: 7px;
            position: absolute;
            box-shadow: 0px 0px 10px 1px #1e1e1e;
            z-index: 9999;
            right: 0;
            opacity: 1;
         }

         .reports-modal.reports-flex-item {
            font-size: 1.5rem !important;
            border: 1px solid red;
            padding: 1rem;
            flex: 1;
            transition: color .25s;
         }

         .reports-modal.reports-flex-item:hover {
            color: white !important;
         }

         .related-reports-report-link {
            // border-bottom: 1px solid gray;
         }

         .close-report-button {
            position: absolute;
            top: 0.25rem;
            right: 1rem;
            font-size: 2.2rem;
            padding: 5px;
            transition: color .25s;
            color:white !important;
            cursor: pointer;
            z-index: 99999;
         }

         .tooltip-inner {
            color: white !important;
         }

         #custom-reports-modal {
            z-index:99999; 
            transform: translate(-50%,-50%); 
            position: fixed; 
            top:50%; 
            left: 50%; 
            width: 30vw; 
            // aspect-ratio: 2/1; 
            background: #ffff;
            border-radius: 10px;
         }

         #exit-click-area {
            z-index: 99998;
            position: fixed;
            height: 100vh;
            width: 100vw;
            background: black;
            opacity: 0.2;

         }

         .gray-color {
            color: #bababa !important;
         }

         .related-site-name {
            // color: #FAC898 !important;
         }


         .center-transform-y {
            transform: translateY(-50%);
         }

         .label-info {
            background-color: #416479 !important;
            color: white !important;
         }

         .label-info {
            background-color: #75a8c6 !important;
            color: #222222 !important;
            font-size: 1rem !important;
         }

         .related-btn {
            height: 14px;
            transition: all .5s;
            margin: 3px;
            cursor: pointer;
         }

         .active-related-btn {
            color: white !important;
         }

         .fade-in {
            -webkit-animation: fade-in .7s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
         }

         .reports-spinner-wrapper {
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0%; 
            left: 0%;
            z-Index: -1;
            // transform: translate(-50%, -50%);
         }

         .lds-dual-ring-larger {
            display: inline-block;
            position: absolute !important;
         }

         .lds-dual-ring-larger:after {
            content: " ";
            display: block;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            border: 2px solid silver;
            border-color: silver transparent silver transparent;
            animation: lds-dual-ring 1.2s linear infinite;  
         }

         .lds-dual-ring {
            display: inline-block;
            position: absolute !important;
            width: 10px;
            height: 10px;
         }

         .lds-dual-ring:after {
            content: " ";
            display: block;
            width: 15px;
            height: 15px;
            margin-left: 8px;
            border-radius: 50%;
            border: 2px solid silver;
            border-color: silver transparent silver transparent;
            animation: lds-dual-ring 1.2s linear infinite;
         }

         @keyframes lds-dual-ring {
            0% {
               transform: rotate(0deg);
            }
            100% {
               transform: rotate(360deg);
            }
         }

         @keyframes fade-in {
            0% {
               opacity: 0;
            }
            100% {
               opacity: 1;
            }
         }`;

      document.getElementsByTagName("head")[0].appendChild(stylesheet);
   },
};

// Event Handlers
let {
   relatedStudiesClickHandler,
   reportsClickHandler,
   reportLinkClickHandler,
   onReportsModalMouseHandler,
} = {
   relatedStudiesClickHandler: async function (event) {
      event.target.className.includes("active-related-btn")
         ? event.target.classList.remove("active-related-btn")
         : event.target.classList.add("active-related-btn");

      let clickedStudy = $(event.target).parents("tbody");
      let clickedStudyID = $(clickedStudy).attr("data-dicomgrid-study-uuid");

      let { patientid, phi_namespace, accession_number } =
         getStudyData(clickedStudyID);

      /* if already expanded, remove... */
      if ($(event.target).attr("showing-related")) {
         $(event.target).removeAttr("showing-related");
         $(`.related-appended-for-${clickedStudyID}`).remove();
         return;
      }

      let spinnerID = renderMRNSpinner(clickedStudy, clickedStudyID);

      /* ...else try to find relateds... */
      let { studies: relateds } = await getRelateds(
         patientid,
         accession_number,
         phi_namespace
      );

      /* if none, show user that none found */
      if (!relateds.length) {
         event.target.classList.remove("active-related-btn");
         DG.Core.showMessage(`No related studies (MRN ${patientid})`, "info");
         return $(`#${spinnerID}`).remove();
      }

      /* otherwise render all the related studies from an HTML template */
      $(event.target).attr("showing-related", "true");

      renderRelatedRow(
         $(clickedStudy)[0],
         clickedStudyID,
         phi_namespace,
         relateds
      );

      return $(`#${spinnerID}`).remove();
   },

   onReportsModalMouseHandler: function (event) {
      // if (event.target.classList.contains("active")) {
      //    event.target.classList.remove("active");
      // } else {
      //    event.target.classList.add("active");
      // }
   },

   reportLinkClickHandler: function (event) {
      //
   },

   reportsClickHandler: async function (event) {
      // TODO move some of this into a rendering function and put in the Rendering object.
      // WARN in this context, DG object DOES NOT WORK (hard to pin down why but see comment at top of file). So using study/get

      event.stopPropagation();

      if ($(event.target).attr("data-related-reports-count") === "0") {
         return DG.Core.showMessage("No Reports", "error");
      }

      /* render/replace the reports modal with loading spinner */
      let studyID = uuidFromRowChildren(event.target);
      let modalHTML = reportsModalTemplate(studyID);

      $(`#related-reports-modal-${studyID}`).remove();

      $(event.target)
         .parents(`#related-appended-${studyID}`)[0]
         .insertAdjacentHTML("beforeend", modalHTML);

      $(`#related-reports-modal-${studyID}`).draggable();
      $(`#related-reports-modal-${studyID}`).resizable();

      /* construct and htmlify report links, then populate modal */
      let studyData = await getStudy(studyID);

      makeReportLinks(studyData, event.target).then(htmlLinks => {
         $(`#reports-spinner-${studyID}`).fadeOut();
         $(`#related-reports-modal-${studyID}`).append(htmlLinks);
      });
   },
};

// Async web stuff
let {
   addScripts,
   getRelateds,
   getNSlist,
   makeReportLinks,
   getSchema,
   getStudy,
} = {
   addScripts: async function (scriptURLs = [""]) {
      for (let url of scriptURLs) {
         try {
            await $.getScript(url);
         } catch (error) {
            console.log(error);
         }
      }
      return;
   },

   getSchema: async function ({ storage_namespace, study_uid, phi_namespace }) {
      let url =
         `https://storelpu.cimar.co.uk/api/v3/storage/study/` +
         `${storage_namespace}/${study_uid}/schema` +
         `?phi_namespace=${phi_namespace}&sid=${getSid()}`;

      try {
         let response = await fetch(url);
         let schema = await response.json();
         return schema;
      } catch (error) {
         console.log(error);
      }
   },

   getStudy: async function (uuid) {
      try {
         let response = await fetch(
            `https://nuffieldhealth.cimar.co.uk/api/v3/study/get` +
               `?sid=${getSid()}&uuid=${uuid}`
         );
         return await response.json();
      } catch (error) {
         console.log(error);
      }
   },

   getNSlist: async function () {
      try {
         let req = await fetch(
            "https://nuffieldhealth.cimar.co.uk/api/v3/user/namespace/list" +
               `?sid=${window.sessionStorage.sid}` +
               `&account_id=2859184d-d648-40ca-9c1a-901770243d7e` +
               `&name_and_id_only=1`
         );
         return await req.json();
      } catch (error) {
         console.log(error);
      }
   },

   getRelateds: async function (mrn, acc, phi_namespace) {
      // `&filter.phi_namespace.equals=a282eb9a-8b48-48dc-b229-9dd5a955dc20` + // non nuffield
      // `&filter.storage_namespace.equals=a282eb9a-8b48-48dc-b229-9dd5a955dc20` + // non nuffield
      let filters =
         `?sid=${window.sessionStorage.sid}` +
         // `&filter.storage_namespace.equals=32ba21ac-3705-4558-89ac-3f58561a276c` + // WARN these lines will vary by account. E.g. Nuffield, both of these are main org since everything is routed through main org by gateway. This would be different in Heart & Lung Health where gateways feed many folders.
         // `&filter.phi_namespace.equals=32ba21ac-3705-4558-89ac-3f58561a276c` + // WARN these lines will vary by account. E.g. Nuffield, both of these are main org since everything is routed through main org by gateway. This would be different in Heart & Lung Health where gateways feed many folders.
         `&filter.patientid.equals=${mrn}` +
         `&filter.accession_number.not_equals_or_null=${acc}` +
         `&extra=1` +
         `&fields=[
                     "first_name",
                     "storage_namespace",
                     "study_description",
                     "attachment_count",
                     "accession_number",
                     "phi_namespace",
                     "patient_name",
                     "study_status",
                     "customfields",
                     "study_date",
                     "patientid",
                     "study_uid",
                     "modality",
                     "created",
                     "thin",
                     "uuid",
                     "hl7"  
                  ]`;
      try {
         let req = await fetch(
            `https://heartlunghealth.cimar.co.uk/api/v3/study/list` + filters
            // `https://nuffieldhealth.cimar.co.uk/api/v3/study/list` + filters
         );
         return await req.json();
      } catch (error) {
         console.log(error);
      }
   },

   makeReportLinks: async function (studyData, reportModal) {
      await pause(1);

      let {
         hl7,
         uuid,
         storage_namespace,
         phi_namespace,
         study_uid,
         thin,
         modality,
      } = studyData;
      let links = [];

      /* HL7 reports */
      if (hl7?.length) {
         for (let msg of hl7) {
            links.push(hl7ReportLinkEl(msg.uuid, uuid));
         }
      }

      /* Storage attachment reports */
      if (!thin) {
         let schema = await getSchema(studyData);
         for (let a of schema?.attachments) {
            links.push(
               reportLinkEl(a, phi_namespace, storage_namespace, study_uid)
            );
         }
      }

      return linksArrayToHTMLstr(links);
   },
};

// ----------------------------------------------- INIT SCRIPT & INTERCEPT NEW STUDY ROW RENDERS -----------------------------------------
init: (() => {
   String.prototype.log = function () {
      console.log(this);
   };

   renderStylesheet();
   addScripts([
      "https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.2/axios.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js",
      "https://code.jquery.com/ui/1.13.2/jquery-ui.js",
   ]);

   new MutationObserver(nuffieldUIobserverCallback).observe(
      $("#data-table")[0],
      { subtree: true, childList: true }
   );

   function nuffieldUIobserverCallback(mutations) {
      for (let mRecord of mutations) {
         if (mRecord.target.id !== "data-table") continue;
         if (mRecord.addedNodes[0]?.nodeName !== "TBODY") continue;

         /* if not continued, then current mRecord is the one that appended study rows to table */
         let studyRows = [...mRecord.addedNodes].filter(
            x => x.nodeName === "TBODY"
         );

         renderRelatedCTAs(studyRows);
      }
   }
})();
// ---------------------------------------------------------------------------------------------------------------------------------------

// DG.ActionHelpers.getStudyInformation is not fit for purpose here because its not returning study data until fetched by the platform itself. The bug took me about 4 years to figure out. FML.
// In other words, the getStudyInformation() method appears to be differently returning (sometimes not wit hl7 array) which is apparently based on the namespace you're in plus the search filters you've applied in the UI
