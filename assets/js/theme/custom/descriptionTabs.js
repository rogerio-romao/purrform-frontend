import { forEach } from "lodash";

export default function () {
  jQuery(document).ready(function () {
    const descriptionOld = document.getElementsByClassName("description-v1");
    if ($("#_product-description").length > 0) {
      //If text is detected within the id _product-description element
      if (
        ~document
          .getElementById("_product-description")
          .innerHTML.toString()
          .indexOf("<!-- pagebreak -->")
      ) {
        const breaks = $("#_product-description")
          .html()
          .trim()
          .split("<!-- pagebreak -->");
    console.log("description-v2");
        document.getElementById("tab-description").innerHTML = breaks[0];
        document.getElementById("tab-composition").innerHTML = breaks[1];
        if (document.getElementById("tab-instructions")) {
          document.getElementById("tab-instructions").innerHTML = breaks[1];
        }
        if (document.getElementById("tab-supplements-composition")) {
          document.getElementById("tab-supplements-composition").innerHTML =
            breaks[1];
        }
        document.getElementById("tab-constituents").innerHTML = breaks[2];
        if (document.getElementById("tab-health-safety")) {
          document.getElementById("tab-health-safety").innerHTML = breaks[2];
        }
        if (document.getElementById("tab-supplements-constituents")) {
          document.getElementById("tab-supplements-constituents").innerHTML =
            breaks[2];
        }
        if (document.getElementById("tab-supplements-instructions")) {
          document.getElementById("tab-supplements-instructions").innerHTML =
            breaks[3];
        }
        /*Mobile tabs content allocation*/
        document.getElementById("tab-mobile-description").innerHTML = breaks[0];
        document.getElementById("tab-mobile-composition").innerHTML = breaks[1];
        if (document.getElementById("tab-mobile-instructions")) {
          document.getElementById("tab-mobile-instructions").innerHTML =
            breaks[1];
        }
        if (document.getElementById("tab-mobile-supplements-composition")) {
          document.getElementById(
            "tab-mobile-supplements-composition"
          ).innerHTML = breaks[1];
        }
        if (document.getElementById("tab-mobile-constituents")) {
          document.getElementById("tab-mobile-constituents").innerHTML =
            breaks[2];
        }
        if (document.getElementById("tab-mobile-health-safety")) {
          document.getElementById("tab-mobile-health-safety").innerHTML =
            breaks[2];
        }
        if (document.getElementById("tab-mobile-supplements-constituents")) {
          document.getElementById(
            "tab-mobile-supplements-constituents"
          ).innerHTML = breaks[2];
        }
        if (document.getElementById("tab-mobile-supplements-instructions")) {
          document.getElementById(
            "tab-mobile-supplements-instructions"
          ).innerHTML = breaks[3];
        }
      } else {
      console.log("description-v1");    
        /*If no pagebreak is detected, the description-v1 elements are made visible and the old system is used to display description tab content.*/
        for (var i = 0; i < descriptionOld.length; i++) {
        //  descriptionOld[i].style.display = "block";
        console.log("test")
        }
      }

     forEach
    }
  });
}
