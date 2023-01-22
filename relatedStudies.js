"use strict";

// TODO attachment count needs to also do hl7/get and pass study ID. To replicate platform's approach, its hl7/get + schema call but attachment count + hl7/get is fine for MVP
// TODO why does report modal not work for MURRAY^MICHAEL but does work for most others (e.g. TUPOU^SIONE)

var print = console.log;
let pause = async s => new Promise(r => setTimeout(r, s * 1000));
let getStudyData = DG.ActionHelpers.getStudyInformation;

(async function main() {
   addScript("https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.2/axios.min.js");
   renderStylesheet();
   renderRelatedCTAs();
})();

function renderRelatedCTAs() {
   let btn = document.createElement("img");

   btn.src = "https://www.cimar.co.uk/wp-content/uploads/2022/10/link-icon.svg";
   btn.classList.add("related-btn");

   $(btn).click(event => studyClickHandler(event));
   $([...$("#data-table").find(".study-actions")]).prepend(btn);
}

async function getRelateds(mrn, acc) {
   try {
      let { namespaces } = await getNSlist();

      namespaces = JSON.stringify(namespaces.map(ns => ns.uuid));

      let req = await fetch(
         `https://nuffieldhealth.cimar.co.uk/api/v3/study/list` +
            `?sid=${window.sessionStorage.sid}` +
            `&filter.storage_namespace.equals=32ba21ac-3705-4558-89ac-3f58561a276c` +
            `&filter.phi_namespace.in=${namespaces}` +
            `&filter.patientid.equals=${mrn}` +
            `&filter.accession_number.not_equals_or_null=${acc}` +
            `&fields=[
               "storage_namespace",
               "study_description",
               "attachment_count",
               "accession_number",
               "phi_namespace",
               "patient_name",
               "study_status",
               "study_date",
               "patientid",
               "study_uid",
               "modality",
               "created",
               "thin",
               "uuid"   
            ]`
      );

      return await req.json();
   } catch (error) {
      console.log(error);
   }
}

async function addScript(url = "") {
   return await $.getScript(url);
}

async function studyClickHandler(event) {
   event.target.className.includes("active-related-btn")
      ? event.target.classList.remove("active-related-btn")
      : event.target.classList.add("active-related-btn");

   let clickedStudy = $(event.target).parents("tbody"),
      clickedStudyID = $(clickedStudy).attr("data-dicomgrid-study-uuid");

   let { patientid, phi_namespace, accession_number } =
      getStudyData(clickedStudyID);

   /* if already expanded, remove... */
   if ($(event.target).attr("showing-related")) {
      $(event.target).removeAttr("showing-related");
      $(`.related-appended-${clickedStudyID}`).remove();
      return;
   }

   let spinnerID = renderSpinner(clickedStudy, clickedStudyID);

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
   insertFromTemplate($(clickedStudy)[0], clickedStudyID, relateds);

   return $(`#${spinnerID}`).remove();
}

async function insertFromTemplate(clickedStudy, clickedStudyID, relateds) {
   let uniqueness = new Set();

   for (let metadata of relateds) {
      if (uniqueness.has(metadata.study_uid)) continue;

      uniqueness.add(metadata.study_uid);

      $(relatedTemplate(clickedStudyID, metadata))
         .insertAfter(clickedStudy)
         .hide()
         .fadeIn();
   }
}

function renderSpinner(clickedStudy, clickedStudyID) {
   $(clickedStudy)
      .find(`[data-dicomgrid-display-name="MRN"]`)[0]
      .insertAdjacentHTML(
         "afterend",
         `<div id="spinner-${clickedStudyID}" class="lds-dual-ring"></div>`
      );
   return `spinner-${clickedStudyID}`;
}

function formatDateStr(date) {
   let temp = date.split("");
   temp.splice(4, 0, "-");
   temp.splice(7, 0, "-");
   return temp.join("");
}

async function getNSlist() {
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
}

function relatedTemplate(clickedStudyID, metadata) {
   let {
      storage_namespace,
      study_description,
      attachment_count,
      accession_number,
      phi_namespace,
      patient_name,
      study_status,
      study_date,
      study_uid,
      modality,
      created,
      uuid,
      thin,
   } = metadata || "";

   let template = `
   <tbody class='related-appended related-appended-${clickedStudyID}'
      id='related-appended-${clickedStudyID}'
      data-dicomgrid-study-uuid="${uuid}" 
      data-dicomgrid-engine-fqdn="storelpu.cimar.co.uk"
      data-dicomgrid-storage-namespace="${storage_namespace}"
      data-dicomgrid-study-uid="${study_uid}"
      data-dicomgrid-phi-namespace="${phi_namespace}"
      data-dicomgrid-study-patient-name="${patient_name}"
      data-dicomgrid-modality="${modality}"
      data-dicomgrid-action-click="highlight-row"
      haslistener="true"
      style="cursor: pointer; pointer-events: stroke;"
   >
   <tr
      valign="top"
      data-dicomgrid-study-uuid="${uuid}"
      data-dicomgrid-engine-fqdn=""
      data-dicomgrid-storage-namespace="${storage_namespace}"
      data-dicomgrid-study-uid="${study_uid}"
      data-dicomgrid-phi-namespace="${phi_namespace}"
      data-dicomgrid-study-patient-name="${patient_name}"
      data-dicomgrid-modality="${modality}"
      class="sort sortables simplified"
      >
      <td>
      </td>
      <td>
         ${
            thin
               ? `<span class='label label-info thin-study' data-i18n-token='study:thin'>Prior</span>`
               : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
         } &nbsp;
         <span data-dicomgrid-tag="AccessionNumber" data-dicomgrid-size="span2"
            ><a
            class="click"
            data-dicomgrid-display-name="Accession"
            data-dicomgrid-filter-element="filter.accession_number.equals"
            data-dicomgrid-action-click="filter-on-field"
            >
         ${accession_number}
         </a></span>
      </td>
      <td>
         <strong
            class="upper primary-info"
            data-dicomgrid-tag="StudyDescription"
            data-dicomgrid-size="span3"
            >
         ${study_description}
         </strong>
         <span class="secondary-info">
         <span data-dicomgrid-tag="Modality">${modality}</span>
      </td>
      <td data-dicomgrid-alttag="StudyCreateDate" class="datetime">
         <span data-perm="20220812" class="primary-info">
         <span class="primary-info">${formatDateStr(study_date)}</span>
      </td>
      <td class="datetime">
         <span data-dicomgrid-tag="StudyCreateDate">
            ${created.split(" ")[0]}</span>
         </span>
      </td>
      <td class="row-actions study">
        
       ${
          thin
             ? `
               <button type="button" class="btn btn-default btn-sm btn-fa-icon" data-dicomgrid-action-click="retrieve-thin-study" rel="tooltip" data-container="body" title="" data-original-title="Retrieve thin study">
               <i class="far fa-share fa-flip-horizontal"></i>
               </button>
            `
             : ""
       }
      <button
         class="btn btn-default btn-sm btn-fa-icon"
         style="position: relative; transform: scale(1.5)"
         id="additional-${uuid}"
         data-dicomgrid-action-click="show-study-reports"
         data-dicomgrid-popover-align="right"
         data-dicomgrid-popover-template="study-reports-template"
         data-dicomgrid-hl7-count="0"
         data-dicomgrid-permissions-disabled="study_report_view study_report_hl7_view"
      >

       

      <span data-original-title="Reports" class="fa fa-file attachment-count">&nbsp;</span><span className="ck-font make-subscript">${attachment_count}</span>

   
      </button>

         <div
            class="btn-group pull-right"
            data-dicomgrid-status=${study_status}"
            data-dicomgrid-permissions-disabled="study_status_edit study_status_manual_edit"
            >
            <button
               class="dropdown-toggle btn btn-sm btn-fa-icon"
               data-toggle="dropdown"
               rel="tooltip"
               title="Study stage"
               data-container="body"
               data-i18n-token="global:change-study-status"
               >
               <div>
                  <span
                     class="study-status"
                     id="study-status-tag-${uuid}"
                     data-dicomgrid-status="${study_status}"
                     >
                  ${study_status}
                  </span>
                  <i class="fas fa-caret-down"></i>
               </div>
            </button>
            <ul class="dropdown-menu dropdown-menu-right">
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status"
                     >Unreported</a
                     >
               </li>
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status">Prior</a>
               </li>
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status">Prelim</a>
               </li>
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status"
                     >In Process</a
                     >
               </li>
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status"
                     >Addenda</a
                     >
               </li>
               <li>
                  <a href="#" data-dicomgrid-action-click="change-study-status"
                     >Complete</a
                     >
               </li>
            </ul>
         </div>
      </td>
   </tr>
</tbody>
   `;

   return template;
}

function renderStylesheet() {
   let stylesheet = document.createElement("style");

   stylesheet.innerHTML = `
      .related-appended * {
         color: #416479 !important;
      }

      .center-transform-y {
         transform: translateY(-50%);
      }

      .label-info {
         background-color: #416479 !important;
         color: white !important;
      }

      .related-btn {
         height: 14px;
         transform: translate(3px,-3px);
         transition: all .25s;
         filter: contrast(.0) brightness(1);
         margin: 3px;
         cursor: pointer;
      }

      .active-related-btn {
         transform: translate(3px,-3px) rotate(180deg);
         filter: contrast(.0) brightness(1.5);

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
         border: 2px solid gray;
         border-color: gray transparent gray transparent;
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
   `;

   document.getElementsByTagName("head")[0].appendChild(stylesheet);
}
