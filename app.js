(function() {
  return {


    //General Local Variables Start Here ------------------------------------------------------------------>

    LeadStatus: "Marketing Qualified Lead (MQL)",
    LeadSource: "Other",
    LeadCategory: "Contact Request",
    LeadSubCategory: "Zendesk Case",
    usSDRRoleID: "00EC000000132sfMAA",
    euSDRRoleID: "00EC0000001331oMAA",
    usEDRRoleID: "00EC000000133fBMAQ",
    euAERoleID: "00EC0000001349eMAA",

    //General Local Variables End Here -------------------------------------------------------------------->

    //SFDC Opty App Components Local Variables Start Here ------------------------------------------------------------------>

    //SFDC Opty App Components Local Variables End Here ------------------------------------------------------------------>

    requests: {

      //General Request Functions Start Here ------------------------------------------------------------------------------------>

      //General Request to get information from Zendesk API
      fetchZendeskData: function(URL) {

        return {
          url: URL,
          type: 'GET',
          dataType: 'json',
          accept: 'application/json'
        };
      },

      //General Request to update information in Zendesk. The data object is passed as a parameter
      updateZendeskData: function(URL, dataobject) {

        return {

          url: URL,
          dataType: 'json',
          type: 'PUT',
          data: dataobject
        };
      },
        
      //General Request to delete information from Zendesk API
      deleteZendeskTag: function(URL, dataobject) {

        return {
          url: URL,
          type: 'DELETE',
          dataType: 'json',
          accept: 'application/json',
          data: dataobject
        };
      },


      //General Rquest Functions  End Here -------------------------------------------------------------------------------------->


      //SFDC Opty App Requests Start Here ------------------------------------------------------------------>

      fetchAccessToken: function(URL) {

        return {
          url: URL,
          type: 'POST',
          CORS: true,
          dataType: 'json'
        };
      },

      fetchSFDCObject: function(URL) {

        return {

          url: URL,
          headers: {
            'Authorization': 'OAuth ' + this.store('SecurityToken')
          },
          dataType: 'json',
          type: 'GET'
        };
      },

      postChatter: function() {

        return {

          url: this.SFDCinstance + "/services/data/v23.0/chatter/feeds/record/" + this.ChatterRecordId + "/feed-items",
          headers: {
            'Authorization': 'OAuth ' + this.store('SecurityToken')
          },
          contentType: 'application/json',
          type: 'POST',
          data: JSON.stringify({
            "body": {
              messageSegments: [{
                type: "mention",
                id: this.ChatterOpenerId
              }, {
                type: "mention",
                id: this.ChatterAEId
              }, {
                type: "mention",
                id: this.ChatterCSMId
              }, {
                type: "mention",
                id: this.SDRLeadId
              }, {
                type: "text",
                "text": this.ChatterMessage
              }, {
                type: "text",
                "text": ' Notification By ' + this.currentUser().name() + ". If you need further information, please follow up with " + this.currentUser().name() + " directly. You can view the customer's Zendesk ticket by clicking the link below. Please confirm once you have reached out to the customer by chattering " + this.currentUser().name()
              }, {
                type: "link",
                url: "https://optimizely.zendesk.com/agent/tickets/" + this.ticket().id()
              }]
            }

          })
        };
      },

      postChatter_single: function() {

        return {

          url: this.SFDCinstance + "/services/data/v23.0/chatter/feeds/record/" + this.ChatterRecordId + "/feed-items",
          headers: {
            'Authorization': 'OAuth ' + this.store('SecurityToken')
          },
          contentType: 'application/json',
          type: 'POST',
          data: JSON.stringify({
            "body": {
              messageSegments: [{
                type: "mention",
                id: this.SDRLeadId
              }, {
                type: "text",
                "text": this.ChatterMessage + ' Notification By ' + this.currentUser().name()
              }]
            }

          })
        };
      },

      //SFDC Opty App Requests End Here ------------------------------------------------------------------>


    },

    events: {

      //General Event Calls Start Here ------------------------------------------------------------------------------------>

      'app.activated': 'initializeApp',
      'ticket.save': 'SaveUpdates',
      'ticket.custom_field_21047815.changed': 'updateImpersonate',
      'click #changerecipient': 'changeRecipient',
      'click #btnSentVia': 'showChangeRecipient',
      'click #saveSentVia': 'updateRecipient2',
      'click #open-close': 'toggleFromAddress',
      'click span.accountLinkHeader': 'toggleAccountLinks',
      'click span.kbLinkHeader': 'toggleKBLinks',
      'click #chatter_button': 'sfdcGetInfo',
      'click #postchatter': 'ChatterConfirmation',
      'click span.notesHeader': 'toggleNotes',
      'click #leadcontinue': 'LeadWait',
      'click #linksetting': 'setLinkSetting',
      'click #countrysetting': 'setCountrySetting',
      'click #switchlead': 'switchLeadCountry',
      'click #cancelSDR': 'cancelChange',
      'click #btnSendMobile': 'changeRecipientMobile',
      'click a.validation': 'validateExperimentId',
      'click a.notes_link': 'toggleAccountNotes',
      'click #collaborator_button': 'openCollaborator',
      'click #collaborators li': 'addCollaborator',
      'click #collaborators li.collab': 'removeCollaborator',
      //'click #add_notes': 'this.updateAccNotes',
      //'blur #acc_notes_input': 'this.saveAccNotes',
      


      //General Event Calls End Here -------------------------------------------------------------------------------------->


      //SFDC Event Calls  Start Here -------------------------------------------------------------------------------------->
      'fetchAccessToken.error': function(data) {
        this.consoleDebug("object", data);



      },



      'fetchAccessToken.done': function(data) {
        this.consoleDebug("normal", "Getting Here!");
        this.consoleDebug("object", data);
        var AccessToken = data.access_token.split('!')[1];

        //If in debug mode, write to console 
        this.consoleDebug("normal", 'OptimizelySFDC - Success - Request to fetch Access Token Successful!');
        this.consoleDebug("object", 'AccessToken Data Object:', data);


        //store the Security Token in the local storage
        this.store('SecurityToken', AccessToken);


        //Check local storage to see if we forced the retrieval of the token. If so, return to the function that called the
        //force token
        if (this.forceToken) {

          //Check local Storage to see which function to go back to since we were forced to get an authentication
          if (this.goToFunction === "search1") {
            //If in debug mode, write to console 
            this.consoleDebug("normal", 'OptimizelySFDC - Success - Returning to check Account after getting Token');
            this.search1CheckAccount();
          } else if (this.goToFunction === "getSDR") {
            this.consoleDebug("normal", 'OptimizelySFDC - Success - Returning to getSDR after getting Token');
            this.getSDR("#usSDR");
          } else {
            //If in debug mode, write to console 
            this.consoleDebug("normal", 'OptimizelySFDC - Success - Returning to check Contact after getting Token');
            this.search2CheckContact();
          }

        }

      }


    },

    //SFDC Event Calls  Start Here -------------------------------------------------------------------------------------->




    //General App Functions Start Here ------------------------------------------------------------------>

    initializeApp: function() {

      //Starts the app by initialize it and getting the data

      //Load screen while we get the data we need
      this.switchTo('loading');

      //Set Local Variables
      this.forceToken = false;
      this.goToFunction = " ";
      this.ChatterRecordId = "";
      this.ChatterOwnerId = "";
      this.ChatterOwnerName = "";
      this.ChatterAE = "";
      this.ChatterAEId = "";
      this.ChatterCSM = "";
      this.ChatterCSMId = "";
      this.ChatterOpener = "";
      this.ChatterOpenerId = "";
      this.OrgId = "";
      this.OrgName = "";
      this.LeadName = "";
      this.RecordType = "";
      this.refresh_token = this.setting('refreshtoken');
      this.client_id = this.setting('clientid');
      this.client_secret = this.setting('clientsecret');
      this.SFDCinstance = this.setting('sfdc');
      this.debugmode = this.setting('debug');
      this.debugobjects = this.setting('debugobjects');
      this.debugChatter = this.setting('debugSFDCsend');
      this.ConfirmationScreen = false;
      this.SDRLeadId = this.setting('sdrleadid');
      this.USLeadId = this.setting('sdrleadid');
      this.EULeadId = this.setting('eusdrleadid');
      this.ExcludeUserList = this.setting('excludesfdcid');
      this.SDRLeadName = this.setting('sdrleadname');
      this.EULeadName = this.setting('eusdrleadname');
      this.USLeadName = this.setting('sdrleadname');
      this.forceToken = false;

      //Get Security Token for Salesforce App
      this.getToken();


      //Get the basic ticket information to load the initial app home screen. 
      var currentTicket = this.ticket();
      var currentClient = currentTicket.requester();
      this.requesterID = currentTicket.requester().id();
      var org = currentTicket.organization();
      var user = currentTicket.requester();
      var imp_email = user.email() || '';

      //Adding impersonate by experiment id button
      var experimentId = currentTicket.customField('custom_field_22559284') || '';
      this.exp = experimentId;
      this.impersonation_link = "https://www.optimizely.com/admin/impersonate?experiment_id=" + this.exp + "&redirect=https://www.optimizely.com/edit?experiment_id=" + this.exp;
      this.userEmail = imp_email.trim();

      //function to check if the ticket was sent to internal-support@ and change the Sent Via field to support@ if necessary
      this.checkIfInternal();
      this.AppInitialized();
        
      //hide outdated Subscription Plan ticket field        
      var subscription_plan = this.ticketFields('custom_field_22704991');
      subscription_plan.hide();
    },

    AppInitialized: function() {
      //REnders the APP UI after all of the data is initialized


      //Set Links for Impersonation and Account Look 
      var currentDomain = this.userEmail.split("@")[1];
      var encodedEmail = encodeURIComponent(this.userEmail);
      this.link1 = "https://www.optimizely.com/admin/impersonate?email=" + this.userEmail + "&redirect=https://www.optimizely.com/dashboard";
      this.link2 = "https://app.optimizely.com/s/user?user_id=" + encodedEmail;
      this.link3 = "https://optimizely.recurly.com/accounts?utf8=✓&q=" + this.userEmail;
      this.link4 = "https://optimizely.recurly.com/accounts?utf8=✓&q=" + currentDomain;
      this.link5 = "http://" + currentDomain;
      this.link6 = "https://appengine.google.com/datastore/explorer?submitted=1&app_id=optimizely-hrd&viewby=gql&query=SELECT+*+FROM+Activity+where+email%3D'" + encodedEmail + "'+order+by+created+desc&namespace=&options=Run+Query";
      //this.link7 = "https://www.optimizely.com/admin/user?search=" + this.userEmail;

      //validate experiment id [workaround]
      var findID = this.exp.match(/(\d+){1}/g);
      var experimentId = parseInt(findID, 10);
      if ((typeof experimentId == "number") && (experimentId.toString().length > 4)) {
        this.link8 = "href=https://app.optimizely.com/s/do/redirect-to-impersonate?input=" + experimentId;
        this.link9 = "href=https://app.optimizely.com/admin/impersonate?experiment_id=" + experimentId + "&redirect=%2Fresults%3Fexperiment_id%3D" + experimentId;
        this.link10 = "href=https://app.optimizely.com/s/experiment_export/" + experimentId;
      } else {
        this.link8 = "";
        this.link9 = "";
        this.link10 = "";
        this.msg = 'No valid experiment id found!';
      }


      //Load Main screen
      this.switchTo('list', {
        link1: this.link1,
        link8: this.link8,
        link9: this.link9,
        link10: this.link10,
        recipient: this.recipient
      });
      this.$('section[data-links]').hide();
      //Load Account Lookup Links, which is hidden by default
      this.$('section[data-links]')
        .html(this.renderTemplate('links', {
          link2: this.link2,
          link3: this.link3,
          link4: this.link4,
          link5: this.link5,
          link6: this.link6
        }));



      //Get the Users setting for ACcount Lookup display and for EU User, and set checkboxes accordingly
      if (this.store('linksetting')) {
        this.$('#linksetting').prop('checked', true);
        this.toggleLinks();
      }

      if (this.store('countrysetting')) {
        this.$('#countrysetting').prop('checked', true);
      }

      //Get SDR Users for the SFDC App for US & EU
      this.getSDR("#usSDR");
      this.getSDR("#euSDR");

      //[Account notes functionality] gather account information to make available for TSEs 
      this.getAccountInfo();
      this.highlightCollaborator();
      
    },

    validateExperimentId: function() {
      //validate experiment id [workaround]
      if (this.msg) {
        services.notify(this.msg, 'error', 2000);
      }
    },

    toggleFromAddress: function() {

      //Logic to toggle the Change From Address form
      if (this.$('.fromAddressLinkHeader i.icon-plus').length === 0) {
        this.$('.fromAddressLinkHeader i').attr('class', 'icon-plus');
      } else {
        this.$('.fromAddressLinkHeader i').attr('class', 'icon-minus');
      }
      return this.$('#form_options').slideToggle();
    },


   toggleAccountLinks: function() {
      return this.$('section[data-links]').slideToggle();
    },

    toggleKBLinks: function() {
        return this.$('#articleWrapper').slideToggle();
    },

    openCollaborator: function(){
        this.highlightCollaborator();
        return this.$('#collaborators').slideToggle();
    },
      
    toggleNotes: function() {
      return this.$('#notesWrapper').slideToggle();
    },

    /*-- Allows for toggling bewtween subscription and contact levels --*/

    toggleAccountNotes: function() {
      if (this.$("a.subscription").hasClass("selected")) {
        this.$("a.subscription").removeClass("selected");
        this.$("#subscription_notes").addClass("hide");
        this.$("a.contact").addClass("selected");
        this.$("#contact_notes").removeClass("hide");
      } else {
        this.$("a.contact").removeClass("selected");
        this.$("#contact_notes").addClass("hide");
        this.$("a.subscription").addClass("selected");
        this.$("#subscription_notes").removeClass("hide");
      }
    },


    addCollaborator: function(element) {
      // Adds a tag with the collaborator's name
      var ticket = this.ticket();
      var tags = ticket.tags();
      var TSE_NAME = "collaborator_" + element.toElement.innerHTML.toLowerCase().split(" ").join("_");
      tags.add(TSE_NAME);
      this.highlightCollaborator();
    },
      
    removeCollaborator: function(element) {
      // Removes tag with the collaborator's name
      var ticket = this.ticket();
      var tags = ticket.tags();
      var ticketAPIURL = "/api/v2/tickets/" + ticket.id() + "/tags.json";
      var collab = element.toElement.innerHTML.toLowerCase().split(" ").join("_");
      var selector = "li[name="+collab+"]";
      this.$(selector).removeClass('collab');

      var dataobject = {
             "tags": ["collaborator_"+collab],
      };

      this.ajax('deleteZendeskTag', ticketAPIURL, dataobject)
        .done(function(data) {
            services.notify("Ticket Updated- Removed "+element.toElement.innerHTML+" as a collaborator");
      });
    },
      
    
    highlightCollaborator: function(){
        // Function to find all collaborators on a ticket and highlight them
        var ticket = this.ticket();
        var tags = ticket.tags();
        var collaborators = [];
        // Check the ticket's tags for tagged collaborators
        tags.forEach(function(tag){
            if(tag.indexOf("collaborator_") != -1){
                var name = tag.split("_");
                // Check if a last initial is included in the agent's name so that it can be added as well
                if(name.length > 2){
                    collaborators.push(name[1]+"_"+name[2]);
                }
                else{
                    collaborators.push(name[1]); 
                }
            }
        });
        // Give all found collaborators the '.collab' class
        collaborators.forEach(function(collab){
            var selector = "li[name="+collab+"]";
            this.$(selector).addClass("collab");
        });
        // Indicate count of total collaborators
        var total = collaborators.length;
        if(total > 0){
            this.$('#collaborator_count').html('('+total+')');
        }
    },


    updateImpersonate: function() {
      //function to update the impersonate email when the user changes it

      var imp_email = '';
      if (this.ticket().customField('custom_field_21047815') === '') {
        imp_email = this.ticket().requester().email();
      } else {
        imp_email = this.ticket().customField('custom_field_21047815');
      }
      this.$('#impersonate').attr("href", "https://www.optimizely.com/admin/impersonate?email=" + imp_email + "&redirect=https://www.optimizely.com/dashboard");

    },
    changeRecipientMobile: function() {
      //Function to change the change via to Mobile Support 

      this.$("#newRecipient").val("mobile-support@optimizely.com");
      this.updateRecipient2();

    },
    checkIfInternal: function() {
      console.log("checking if from internal");
      //Function to change the change messages from internal-support to support 
      if (this.ticket().customField('custom_field_21226130') === 'support-internal@optimizely.com') {
        console.log("ticket from internal - switching recipient to support@");
        this.$("#newRecipient").val("support@optimizely.com");
        this.updateRecipient2('internal');
      }
    },
    updateRecipient2: function(usertype) {
      //Function that is fired off to change the Recipient (Sent Via Field). This is fired off by when the ticket is first opened, when the group is changed with the ticket open, or by a user asking to change it via the update button
      //The system will check to make sure the recipient email is set to support@optimizely.com if the ticket group is not TAM. Updates are only made if the ticket is not closed
      //System initiatied checks will come in with a usertype parameter set to System
      var ticketStatus = this.ticket().status();
      if (ticketStatus !== "closed") {

        //set local variables
        var user = "";
        var newemail = "";
        var runAPI = false;
        var oldemail = this.recipient;
        var currentDate = new Date();


        //check the user and define local variables
        if (usertype === "system") {
          user = "OptyApp (System Check)";
          newemail = "support@optimizely.com";
        }
        if (usertype === "internal") {
          user = this.currentUser().name();
          newemail = this.recipient = "support@optimizely.com";
          runAPI = true;
        } else {
          user = this.currentUser().name();
          newemail = this.recipient = this.$("#newRecipient").val();
        }

        if (usertype !== "system") {
          runAPI = true;
        }

        if (runAPI) {
          //Code to update the ticket with a comment for tracking purposes. 
          var commentText = "Opty App - Internal Tracking - Recipient Changed from " + oldemail + " to " + newemail + " by " + user + " at " + currentDate;
          var dataObject = {
            "ticket": {
              "recipient": newemail,
              "comment": {
                "public": false,
                "body": commentText
              }
            }
          };
          var UserAPIURL = "/api/v2/tickets/" + this.ticket().id() + ".json";

          this.ajax('updateZendeskData', UserAPIURL, dataObject)
            .done(function(data) {

              //If in debug mode, write to console
              this.consoleDebug("object", 'ZD Ticket Update (Recipient Update):', data);

              //After successful update, update APP screen   
              this.recipient = newemail;
              this.$('#recipient').html(this.recipient);
              if (this.ticket().customField('custom_field_21226130') !== this.recipient) {
                console.log("running 3", this.ticket().customField('custom_field_21226130'), this.recipient);
                this.ticket().customField('custom_field_21226130', this.recipient);
              }
              if (usertype !== "system") {
                this.$('#appModal').modal("hide");
              }
              services.notify("Ticket Updated- Sent Via field updated to " + this.recipient);
            })
            .fail(function(data) {
              this.consoleDebug("object", 'Error Updating Ticket for Sent Via:', data);
              services.notify("Error! Update to Sent Via Field Failed. Tried to change from  " + oldemail + " to " + newemail);

              if (usertype !== "system") {
                this.$('#SentVia').removeClass("show");
                this.$('#SentVia').addClass("hide");
                this.$('#userMessages').removeClass("hide");
                this.$('#userMessages').addClass("show");
                this.$('#userMessages').text("Error in updating Recipient (Save Via) in Zendesk Ticket. Please try again or contact your administrator.");
              }
            });
        }
      }

    },

    checkRecipient: function(initialize) {
      //function that is run to check the recipient via a system check. It runs the function above with a parameter
      //No longer needed
      //this.updateRecipient2("system");

    },
    SaveUpdates: function() {
      //Function to run code when the Ticket is saved (user hits Submit)
      var ticket = this.ticket();
      var status = ticket.status();
      var form = ticket.form().id();
      var requester = ticket.requester().email();

      //Check for a valid requester before saving the ticket
      try {
        if (requester === 'zendesk-connector@voxter.com' || requester === 'noreply@optimizely.com' || requester === 'optiverse@optimizely.com' || requester === 'support247@optimizely.zendesk.com'){
              return "The ticket was not updated. Please verify the requester is valid before re-saving.";
         }
       }
       catch (err) {
            return true;
       }
      // Prevent ticket from being put in pending status unless Managing Team, Case Category and Case Type are filled out
      if (status === "pending") {
        try {
          var manTeam = ticket.customField("custom_field_24732737");
          var caseCat = ticket.customField("custom_field_22597344");
          var caseType = ticket.customField("custom_field_21129370");

          // If no value selected, prevent save
          if (manTeam.length === 0 || caseCat.length === 0 || caseType.length === 0) {
            return "The ticket was not updated. Please check 'Managing Team', 'Case Category' and 'Case Type' are set before re-saving.";
          }
        }
        // If one of the fields does not exist, save ticket regardless
        catch (err) {
          return true;
        }
      }
      // Prevent ticket from being put on hold unless a reminder has been set in the Remind Me One Day Before field
      // unless the ticket form is Billing & Account questions
//      else if (status === "hold") {
//        try {
//          var reminder = ticket.customField("custom_field_26075538");
//          var today = new Date();
//          console.log(reminder < today);
//          if (reminder === null && form != 32724) {
//            return "The ticket was not updated. Please set a reminder in the 'Remind me one day before:' field before placing the ticket on hold.";
//          } else if (reminder < today && form != 32724) {
//            return "The ticket was not updated. When placing a ticket on hold, the date in the 'Remind me one day before:' field must be a date in the future.";
//          }
//        } catch (err) {
//          return true;
//        }
//      }
    },


    showChangeRecipient: function() {

      //Populate the modal with the necessary information by adding classes and updating titles
      this.$('#newRecipient').attr('value', this.recipient);
      this.$('#modalHeader').text("Update Sent Via (Optimizely Recipient)");
      this.$('#SentVia').removeClass("hide");
      this.$('#SentVia').removeClass("show");


    },


    setLinkSetting: function() {

      //Function to change the local storage variables when a user updates the "Account Links Expanded option"
      if (this.$('#linksetting:checked').length > 0) {
        this.store('linksetting', true);
      } else {
        this.store('linksetting', false);
      }

      //check to see if the linksetting setting in the cookie is true, if so, open the Account links if it isn't set.
      if (this.store('linksetting') && this.$('.LinkHeader i.icon-minus').length === 0) {
        this.toggleLinks();
      }

    },

    setCountrySetting: function() {

      //Function to change the local storage variables when a user updates the "Account Links Expanded option"
      if (this.$('#countrysetting:checked').length > 0) {
        this.store('countrysetting', true);
      } else {
        this.store('countrysetting', false);
      }

    },


    consoleDebug: function(type, message, data) {

      //Generic function to write to the console for debugging purchases 
      if (type === "normal") {
        if (this.debugmode) {
          console.log(message);
        }

      } else {
        if (this.debugmode && this.debugobjects) {
          console.log(message);
          console.log(data);
        }
      }

    },


    //General App Functions End Here ------------------------------------------------------------------>


    //SFDC Opty App Functions Start Here ------------------------------------------------------------------>

    getToken: function() {

      //Function to get the SFDC Token. The token is stored in the Local Storage ZD Cookie so we only have to get it if it's not there or expired. 
      //Check to see if it's expired, is not made until the initial SFDC request is made
      this.sfdcmodal = "#loading";

      //Build the URL for the SFDC API Call
      var URLBase = "https://na28.salesforce.com/services/data/v23.0/";
      this.APIBase = URLBase;

      //Check to see if we already have an AccessToken in the LocalStorage. If it's empty, get a new one
      if (this.store('SecurityToken') === null || this.forceToken) {
        var URL = "https://login.salesforce.com/services/oauth2/token?grant_type=refresh_token&client_id=" + this.client_id + "&client_secret=" + this.client_secret + "&refresh_token=" + this.refresh_token;
        this.consoleDebug("normal", URL);
        this.ajax('fetchAccessToken', URL);
      } else {
        //Debug code
        this.consoleDebug("normal", 'OptiimzelySFDC - Success - Security Token already retrieved, no need to get it again.');
      }
      //End of getTokenFunction
    },

    getAccountInfo: function() {

      //Function that is called when the app is initialized 
      //This is the same as sfdcGetInfo except for when it is initialized and what information is captured
      //Function will get the ticket information, and look up the Organization information using the Zendesk API. 
      //When an org is found, the app goes to the search for Account Function. If it isn't, it goes to the search for Contact function
      //example org URL: https://optimizely.zendesk.com/api/v2/organizations/4681458087.json

      //Set Ticket Information into variables and store them into local storage
      var currentTicket = this.ticket();
      var org = currentTicket.organization();
      var user = currentTicket.requester();
      this.accountName = "";
      var msg;

      if (org) {
        this.accountName = org.name();
          this.csm = org.customField("zendesk_assigned_csm");
          this.subscriptionMrr = org.customField("subscription_mrr");
          this.renewal = org.customField("subscription_start_date");
          this.solutionsPartner = org.customField("partner_name");
          this.accountMrr = org.customField("account_mrr");
          this.orgDetails = org.customField("details");
          this.subscriptionPlan = org.customField("subscription_plan");
          this.inOnboarding = org.customField("account_in_onboarding") === true ? 'yes' : 'no';
          this.formattedPlan = this.formatTitle(this.subscriptionPlan);
          this.highestPlan = currentTicket.customField('custom_field_32289497');
          //based on the 'High-Risk Account' checkbox at the org level
          this.churnRisk = org.churn_risk === true ? 'yes' : 'no';

          if(org.customField("has_enterprise_potential") === true){
              msg = "Enterprise potential!";
              this.showAccountStatus(msg);
          }
          this.subscription_id = org.customField("subscription_id");
          this.checkTrialStatus();
          this.isPlanSupported(this.subscriptionPlan, this.highestPlan);
          this.prioritySupport = org.customField('priority_support');
          
          if(org.customField('priority_support') === 'priority_support_org_yes'){
              msg = "Account entitled to Priority Support";
              this.showAccountStatus(msg);
          }
          else if(org.customField('priority_support_manual_override') === true){
              msg = "Account entitled to Priority Support";
              this.showAccountStatus(msg);
          }

          //End get org information

          //Use the Zendesk API to get the User data
          //example URL: https://optimizely.zendesk.com/api/v2/users/1070462067.json      
          //Pass data to local variables
          this.contactName = user.name();
          this.timeZone = user.customField("time_zone");
          this.phone = user.customField("user_phone_number");
          this.developerCertified = user.customField("developer_certified_user");
          this.platformCertified = user.customField("platform_certified_user");
          this.recentTickets = user.customField("tickets_closed_this_month");
          this.userDetails = user.details();
          this.zendesk_salesforce_contact_id = user.customField("zendesk_salesforce_contact_id");
          this.org = org.customField("id");
          //End get contact information



          //Set default Salesforce links to the overview pages for contacts, accounts and subscription
          var orgUrl = "https://c.na28.visual.force.com/apex/Skuid_SubscriptionsTab?save_new=1&sfdc.override=1";
          var accUrl = "https://c.na28.visual.force.com/apex/Skuid_AccountsTab?save_new=1&sfdc.override=1";
          var userUrl = "https://c.na28.visual.force.com/apex/Skuid_ContactsTab?save_new=1&sfdc.override=1";

          // If we have the contact id, account id or subscription id, update the links to go directly to this record
          if (this.subscription_id !== undefined) {
            orgUrl = "https://c.na28.visual.force.com/apex/Skuid_SubscriptionDetail?id=" + this.subscription_id + "&sfdc.override=1";
          }
          if (this.org !== undefined) {
            accUrl = "https://c.na28.visual.force.com/apex/Skuid_AccountDetail?id=" + this.org + "&sfdc.override=1";
          }
          if (this.zendesk_salesforce_contact_id !== undefined) {
            userUrl = "https://c.na28.visual.force.com/apex/Skuid_ContactDetail?id=" + this.zendesk_salesforce_contact_id + "&sfdc.override=1";
          }

          this.sfdcSubscription = "<p><a target='_blank' href=" + orgUrl + ">Go to SFDC Subscription</a></p>";
          this.sfdcAccount = "<p><a target='_blank' href=" + accUrl + ">Go to SFDC Account</a></p>";
          this.sfdcUser = "<p><a target='_blank' href=" + userUrl + ">Go to SFDC User</a></p>";

          this.sfdcSubscription = orgUrl;
          this.sfdcAccount = accUrl;
          this.sfdcUser = userUrl;


          //format renewal date before rendering template
          this.formattedRenewal = this.formatDate(this.renewal);


          this.$('section[account-notes]')
            .html(this.renderTemplate('accountInfo', {
              accountName: this.accountName,
              csm: this.csm,
              inOnboarding: this.inOnboarding,
              subscriptionMrr: this.subscriptionMrr,
              accountMrr: this.accountMrr,
              renewal: this.formattedRenewal,
              solutionsPartner: this.solutionsPartner,
              churnRisk: this.churnRisk,
              subscriptionPlan: this.formattedPlan,
              contactName: this.contactName,
              timeZone: this.timeZone,
              phone: this.phone,
              developerCertified: this.developerCertified,
              platformCertified: this.platformCertified,
              recentTickets: this.recentTickets,
              orgDetails: this.orgDetails,
              userDetails: this.userDetails,
              sfdcSubscription: this.sfdcSubscription,
              sfdcAccount: this.sfdcAccount,
              sfdcUser: this.sfdcUser
            }));

      }
        else {
            this.showEnterpriseStatus("No organization associated with this ticket");
        }

      //End getAccountInfo function
    },
      
    formatDate : function(date){
        var newDate = new Date(date);
        var newDateString = newDate.toDateString();
        var final = newDateString === 'Thu Jan 01 1970' || newDateString === 'Invalid Date' ? '' : newDateString;
        return final;
     },
      
     formatTitle : function(str) {
        str = str.replace(/_/g, ' ');
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
     },
      
    checkTrialStatus: function(){
        var currentTicket = this.ticket();
        var org = currentTicket.organization();
        var now = new Date();
        var msg = '';
        
        this.isEnterpriseTrial = org.customField("is_enterprise_trial"); //boolean
        this.subscriptionStatus = org.customField("subscription_status"); //should = trial_sub
        this.trialStart = new Date(org.customField("trial_start_date")); //date
        this.trialEnd = new Date(org.customField("trial_end_date")); //date
        var trialEndString = this.trialEnd.toString();
        
        if(this.subscriptionStatus === 'active_sub'){
            return;
        }
        else if(this.subscriptionStatus === 'trial_sub'){
            msg = "Active Free Trial";
        }
        if(trialEndString.indexOf('Thu Jan 01 1970') > -1){
            return;
        }
        else if(this.trialEnd > now){
                msg = "Active Free Trial until "+this.formatDate(this.trialEnd)+".";
        }
        else if(this.trialEnd < now){
                msg = "Free Trial expired on "+this.formatDate(this.trialEnd)+". Please contact sales via Chatter.";
        }

        this.showEnterpriseStatus(msg);
        
    },
      
    showEnterpriseStatus: function(msg){
        this.$('section[trial-status]')
        .html(this.renderTemplate('trialStatus', {
          message: msg
        }));
    },
      
    showAccountStatus: function(msg){
        this.$('section[account-status]')
        .html(this.renderTemplate('trialStatus', {
          message: msg
        }));
    },
      
    isPlanSupported: function(plan, highestPlan){
        //current list of available plans as of June 29, 2016
        var supportedPlans = ["agency", "agency_platinum_one_year", "enterprise", "enterprise_elite", "enterprise_premium", "enterprise_professional", "enterprise_standard", "free", "free_developer", "free_employee", "free_enterprise_trial", "free_nonprofit", "free_partner_sandbox", "gold", "gold_one_year", "gold_two_year", "gold_startup_pack", "paygo", "platinum", "platinum_one_year", "platinum_two_year", "silver", "silver_one_year", "silver_sitepoint_discount", "silver_two_year", "silver_yc_appsumo_discount", "enterprise_premium_with_personalization_professional", "enterprise_premium_with_personalization_standard", "free_personalisation_trial"];
        var notSupported = ["bronze", "bronze_one_year", "bronze_two_year", "bronze_yc_appsumo_discount", "starter", ""];
        if(supportedPlans.indexOf(highestPlan) === -1 && notSupported.indexOf(plan) > -1){
            this.showEnterpriseStatus('This organization is not entitled to support!');
        }
        else {
            return;
        }
    },

    sfdcGetInfo: function() {

      console.log("calling sfdcGetInfo");

      //Function that is called when the user hits the "Post to Chatter"
      //Function will get the ticket information, and look up the Organization information using the Zendesk API. 
      //When an org is found, the app goes to the search for Account Function. If it isn't, it goes to the search for Contact function

      //Reset Modal Buttons to Default State
      this.modalButtonReset();
      this.modalCountry();

      //Hide all other divs in modal
      this.$("#confirmation").addClass("hide");
      this.$("#confirmation").removeClass("show");
      this.$("#newlead").addClass("hide");
      this.$("#newlead").removeClass("show");
      this.$("#leadconf").addClass("hide");
      this.$("#leadconf").removeClass("show");

      //Show loading screen
      this.$(".modal_sfdc").removeClass("hide"); this.$(".modal_sfdc").addClass("show");
      this.$("#loadingheader").text("The system is looking up the requester in Salesforce via a Account, Contact, or Lead");
      this.$("#loading").addClass("show");
      this.$("#loading").removeClass("hide");
      this.sfdcmodal = "#loading";

      //Clear Variables
      this.ChatterRecordId = "";
      this.chatterOwnerId = "";
      this.ChatterOwnerName = "";
      this.ChatterCSM = "";
      this.ChatterOpener = "";
      this.ChatterAE = "";
      this.LeadName = "";
      this.LeadLN = "";
      this.LeadFN = "";
      this.LeadCompany = "";
      this.RecordType = "";
      this.ChatterMessage = "";

      //Set Ticket Information into variables and store them into local storage
      var currentTicket = this.ticket();
      this.TktEmail = currentTicket.requester().email();
      this.TktName = currentTicket.requester().name();
      this.TktUserId = currentTicket.requester().id();
      this.TktSubject = currentTicket.subject();
      this.TktOrg = currentTicket.organization();
      this.TktOrgName = "";
      if (this.TktOrg) {
        this.TktOrgName = this.TktOrg.name();
      }

      //Debug Mode - Log to Console
      this.consoleDebug("normal", 'OptimizelySFDC - Success - Zendesk Information Retrieved and stored in local storage ');
      this.consoleDebug("normal", "OptimizelySFDC - Info - Basic Ticket Information -  Email= " + this.TktEmail + "; Name = " + this.TktName + "; UserID= " + this.TktUserId + "; Org=" + this.TktOrgName);

      //Check if Org exists
      if (this.TktOrg) {
        this.consoleDebug("normal", 'OptimizelySFDC - Info - Starting SFDC Check on Subscription ');
        this.search1CheckAccount();
        this.OrgId = this.TktOrg.id();
        this.OrgName = this.TktOrgName;

      } else {
        this.consoleDebug("normal", 'OptimizelySFDC - Info - Bypassed check on Account because Zendesk didn\'t return an organization for the user');
        this.search2CheckContact();
      }

    },

    getSDR: function(country) {
      //function to get the all of the SDR names

      var roleIDs = "";
      if (country === "#usSDR") {
        roleIDs = "'" + this.usSDRRoleID + "','" + this.usEDRRoleID + "'";
      } else {
        roleIDs = "'" + this.euSDRRoleID + "','" + this.euAERoleID + "'";
      }

      var URLBase = this.APIBase + "query/?q=";
      var action = "SELECT+Id,Name,Alias+from+User+where+UserRoleId+IN+(" + roleIDs + ")";

      this.ajax('fetchSFDCObject', URLBase + action)
        .done(function(data) {
          this.consoleDebug("object", "SDR User Object (" + country + ")", data);


          for (var i = 0; i < data.totalSize; i++) {
            this.$(country).append("<option value='" + data.records[i].Id + "'>" + data.records[i].Name + "</option>");
          }

        })
        .fail(function(data) {
          this.consoleDebug("object", "SDR User Request Failed", data);
          if (data.statusText.trim() === "Unauthorized") {
            this.consoleDebug("normal", 'OptimizelySFDC - Info - Initial attempt to get SFDC User object failed because of invalid session at Account Check. Going to get a new one!');

            //Go get a new Token since it's expired 
            this.forceToken = true;
            this.goToFunction = "getSDR";
            this.getToken();
          }
        });

    },



    search1CheckAccount: function() {

      //Function that looks up the Subscription in SFDC. 
      //If it exists at any point, then it goes to next function to search for Contact (search2CheckContact)

      //Debug Mode - Log to Console
      this.consoleDebug("normal", 'OptimizelySFDC - Info - In search Subscription function ');

      //Set SFDC API URL for Subscription Search
      // Get subscription code from the Organization name in Zendesk
      var numberPattern = /([0-9]+)/g;
      var AccountName = this.TktOrgName.match(numberPattern);
      var URLBase = this.APIBase + "query/?q=";

      // Search for SFDC subscription records for a record which matches the snippet ID (account code)
      var action = "SELECT+Id,Plan_Name__c,Subscriber__c,Status_zSub__c,Account__r.Account_ID_18_Char__c,Account__r.Team_Member_1__c,Account__r.Team_Member_1_First_Name__c,Account__r.Team_Member_1_Last_Name__c,Account__r.Team_Member_2__c,Account__r.Team_Member_2_First_Name__c,Account__r.Team_Member_4__c,Account__r.Team_Member_4_First_Name__c+FROM+Subscription__c+WHERE+Account_Code__c='" + AccountName + "'";

      //Debug Mode & Debug Object Mode - Log to Console
      this.consoleDebug("object", 'OptimizelySFDC - API Call -', URLBase + action);

      //Start Ajax Request to SFDC to get Account. After a successful request, check the data returned
      this.ajax('fetchSFDCObject', URLBase + action)
        .done(function(data) {
          //Debug Mode & Debug Object Mode - Log to Console
          this.consoleDebug("object", 'Fetch SFDC Fetch Subscription Data Object: ', data);

          //SFDC Check 1 - If Data exists, look at what data is inside.
          if (data.done === true) {

            //Debug Mode - Log to Console
            this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Data Object had DONE record');

            //Check to make sure there is a record returned
            if (data.totalSize !== 0) {
              //Debug Mode - Log to Console
              this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Found that Data object has Subscription ID!');

              //Get the Plan Type and Subscriber from the data rerturned. 
              var PlanType = data.records[0].Plan_Name__c;
              var Subscriber = data.records[0].Subscriber__c;
              var Status = data.records[0].Status_zSub__c;
              console.log(PlanType,Subscriber,Status);

              if (true) {

                //Debug Mode - Log to Console
                this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Subscription was found that was active. ');

                //Data check, make sure the account is Gold, Platinum, Agency 
                if (PlanType.indexOf("latinum") > -1 || PlanType.indexOf("old") > -1 || PlanType.indexOf("gency") > -1 || PlanType.indexOf("nterprise") > -1) {

                  //Debug Mode - Log to Console
                  this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Subscription found was Gold, Platinum, Enterprise or Agency.');

                  //Account is subscribed, and plan is Platinum, Agency, Gold so store data into Chatter variables
                  this.ChatterRecordId = data.records[0].Account__r.Account_ID_18_Char__c;
                  this.ChatterOwnerId = data.records[0].Account__r.Team_Member_1__c;
                  this.ChatterOwnerName = data.records[0].Account__r.Team_Member_1_First_Name__c;
                  this.ChatterAE = data.records[0].Account__r.Team_Member_1_First_Name__c;
                  this.ChatterAEId = data.records[0].Account__r.Team_Member_1__c;
                  this.ChatterCSM = data.records[0].Account__r.Team_Member_2_First_Name__c;
                  this.ChatterCSMId = data.records[0].Account__r.Team_Member_2__c;
                  this.ChatterCSMName = data.records[0].Account__r.Team_Member_2_First_Name__c;
                  this.ChatterOpenerId = data.records[0].Account__r.Team_Member_4__c;
                  this.ChatterOpenerName = data.records[0].Account__r.Team_Member_4_First_Name__c;
                  this.ChatterOpener = data.records[0].Account__r.Team_Member_4_First_Name__c;


                  //Change the screen to show the Chatter message post before going forward
                  this.RecordType = "Subscription";
                  this.renderConfirmation1("Step 1 - Subscription Chatter Notification Options");
                  //End check if plan type
                } else {

                  //Account was found, but it was not a platinum, gold, or agency account. Check for lead and go from there. 
                  //If in debug mode, write to console 
                  this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Subscription was found but it was not Gold, Platinum, or Agency. Business Rules say search for Lead');

                  //Call function to check for Lead
                  this.search3CheckLead(data);
                }
                //End check on subscriber
              } else {
                //Account is not subscribed, look for the person as a lead
                //Debug Mode - Log to Console
                this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Subscription -  SFDC Data Returned - Subscription was found but it was not active. Business Rules say to search for Lead');

                //Call function to check for Lead
                this.search3CheckLead(data);
              }
            }

            //SFDC Object doesn't have Account ID, so there was an error in the search. Log to console and start Contact Record search
            else {
              //Debug Mode - Log to Console
              this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Subscription was not found, proceeding to contact search!');

              //Call function to check for Lead
              this.search3CheckLead(data);
            }
            //End check on Data=Done 
          }


          //If we recieved done object but it's not true, assume there is another error
          else {
            //Debug Mode - Log to Console
            this.consoleDebug("normal", 'OptimizelySFDC - Error - Bypassed the Subscription check because it didn\'t return error or expected object!');

            //Proceed to check via Contact since we got unexpected error
            this.search2CheckContact(data);
          }
        })

      .fail(function(data) {
        //Function to handle a failed request to SFDC
        //Check to see if reason data was not returned is because of an invalid session

        this.consoleDebug("object", "OptySFDC - CheckContactFailed Object:", data);

        if (data.statusText.trim() === "Unauthorized") {

          this.consoleDebug("normal", 'OptimizelySFDC - Info - Initial attempt to get SFDC object failed because of invalid session at Account Check. Going to get a new one!');

          //Go get a new Token since it's expired 
          this.forceToken = true;
          this.goToFunction = "search1";
          this.getToken();
        }
        //We received an error message outside of Invalid Session
        else {
          //Debug Mode - Log to Console 
          this.consoleDebug("normal", 'OptimizelySFDC - Error - Account check stopped because we recieved an error or object from SFDC that we did not expect (Done receieved)!');

          //Render the 1st screen again and show the message
          this.renderMessage("error", "Account search stopped because of an unexpected error!");

        }

      });

    },


    search2CheckContact: function(subInfo) {

      //Function that checks to see if an contact exits and if they roll up to an account. If they do, do the same as Search 1
      //If so, then it gets the AE, SDR information
      //If not, proceed to serach3CheckLead

      //Debug Mode - Log to Console
      this.consoleDebug("normal", 'OptimizelySFDC - Info - In search Contact function ');

      //Set SFDC API URL for Contact Search
      var URLBase = this.APIBase + "query/?q=";
      var Contact = this.TktEmail.replace("#", "%23").replace("$", "%24").replace("%", "%25").replace("&", "%26").replace("'", "%27").replace("(", "%28").replace(")", "%29").replace("*", "%2A").replace("+", "%2B").replace(",", "%2C").replace("-", "%2D").replace("/", "%2F").replace("~", "%7E");
      var action = "SELECT+Contact.Contact_ID_18_Char__c,Contact.Account.Id,Contact.Account.Name,Contact.FirstName,Contact.LastName,Contact.Account.OwnerId,Contact.Owner.Id+FROM+Contact+WHERE+email='" + Contact + "'";
      console.log("subinfo");
      console.log(subInfo);

      //Debug Mode & Debug Object Mode - Log to Console
      this.consoleDebug("object", 'Optimizely SFDC - API Call -  ', URLBase + action);

      //Make the Call to get the SFDC Contact via API
      this.ajax('fetchSFDCObject', URLBase + action)
        .done(function(data) {
          //Debug Mode & Debug Object Mode - Log to Console
          this.consoleDebug("object", "Fetch SFDC Fetch Contact Data Object:", data);


          //SFDC Check 1 - If Data exists, look at what data is inside.
          if (data.done === true) {
            //Debug Mode - Log to Console 
            this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Found that Data object had DONE Object');

            //Verify that the data returned has account returned
            if ((data.totalSize !== 0) && (data.records[0].Account != null)) {

              var PlanType = data.records[0].Account.Account_Plan_Derived__c;
              var Subscriber = data.records[0].Account.recurly__Subscriber__c;

                //Check to see if the account is Gold, Platinum, or Agency. 
                if (PlanType === "platinum" || PlanType === "gold" || PlanType === "agency") {

                  if (data.records[0].Owner.Id != null) {
                      this.ChatterOwnerName = data.records[0].Owner.Id;
                  }


                  this.ChatterRecordId = data.records[0].Contact_ID_18_Char__c;
                  this.ChatterOwnerId = data.records[0].Owner.Id;
                  this.OrgName = data.records[0].Account__r.Name;
                  this.ChatterAE = subInfo.records[0].Account__r.Team_Member_1_First_Name__c;
                  this.ChatterAEId = subInfo.records[0].Account__r.Team_Member_1__c;
                  this.ChatterCSM = subInfo.records[0].Account__r.Team_Member_2_First_Name__c;
                  this.ChatterCSMId = subInfo.records[0].Account__r.Team_Member_2__c;
                  this.ChatterCSMName = subInfo.records[0].Account__r.Team_Member_2_First_Name__c;
                  this.ChatterOpenerId = subInfo.records[0].Account__r.Team_Member_4__c;
                  this.ChatterOpenerName = subInfo.records[0].Account__r.Team_Member_4_First_Name__c;
                  this.ChatterOpener = subInfo.records[0].Account__r.Team_Member_4_First_Name__c;


                  //Render the Confirmation screen to present data back to the user
                  this.RecordType = "Contact";
                  this.renderConfirmation1("Step 1 - Account Contact Notification Options");

                } else {
                  //Account was found, but it was not a platinum, gold, or agency account. Check for lead and go from there. 
                  //Debug Mode - Log to Console     
                  this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Account was found but it was not Gold, Platinum, or Agency. Business Rules say search for Lead');

                  if (this.QualifiedLead === "Qualified" || this.QualifiedLead === "Converted") {

                    this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Account was found but it was not Gold, Platinum, or Agency. Business rules overriden since it is an already qualified lead');

                    if (data.records[0].Account.Owner != null) {
                      this.ChatterOwnerName = data.records[0].Owner.Id;
                    }

                    //Render the Confirmation screen to present data back to the user
                    this.ChatterRecordId = data.records[0].Contact_ID_18_Char__c;
                    this.ChatterOwnerId = data.records[0].Owner.Id;
                    this.OrgName = data.records[0].Account.Name;
                    this.ChatterAE = subInfo.records[0].Account__r.Team_Member_1_First_Name__c;
                    this.ChatterAEId = subInfo.records[0].Account__r.Team_Member_1__c;
                    this.ChatterCSM = subInfo.records[0].Account__r.Team_Member_2_First_Name__c;
                    this.ChatterCSMId = subInfo.records[0].Account__r.Team_Member_2__c;
                    this.ChatterCSMName = subInfo.records[0].Account__r.Team_Member_2_First_Name__c;
                    this.ChatterOpenerId = subInfo.records[0].Account__r.Team_Member_4__c;
                    this.ChatterOpenerName = subInfo.records[0].Account__r.Team_Member_4_First_Name__c;
                    this.ChatterOpener = subInfo.records[0].Account__r.Team_Member_4_First_Name__c;

                    this.RecordType = "Contact";
                    this.renderConfirmation1("Step 1 - Chatter Notification Options");
                  } else {

                    //Look for the Lead since the account was subscribed but not platinum, gold, agency
                    this.search3CheckLead();
                  }


                }
              //End check that data has been returned
            }

            //Data object had Done record, but it didn't have an account associated to the contact. look for a lead
            else {
              this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Account via Conact-  SFDC Data Returned - Contact did not have an account record ');

              //Check to see if this contact search came from the qualified sales lead. If it is, then go to great a lead to prevent an infinite loop 
              //set internal variable to prevent infinite loop that goes from Lead to Contact and back to Lead
              if (this.QualifiedLead === "Qualified") {

                this.consoleDebug("normal", 'OptimizelySFDC - Info- Search Account via Contact- No Account found for qualified Lead. Creating a new one!');
                this.renderNewLead();
              }
              //Look for Lead
              this.search3CheckLead();
            }


            //End Data Done check
          } else {
            //Last check, we didn't get an error message that we expected or Done Object. Stop Execution and display error to user

            this.consoleDebug("normal", 'OptimizelySFDC - Error - Contact check stopped because we recieved an error or object from SFDC that we did not expect (Done not received)!');

            //Render the 1st screen again and show the message
            this.renderMessage("error", "Contact search stopped because of an unexpected error!");

          }

          //End Analysis of Contact SFDC Object Returned

        })
        .fail(function(data) {
          //Function to handle a failed request to SFDC
          //Check to see if reason data was not returned is because of an invalid session

          this.consoleDebug("object", "OptySFDC - CheckContactFailed Object:", data);
          if (data.statusText.trim() === "Unauthorized") {

            //Debug Mode - Log to Console 
            this.consoleDebug("normal", 'OptimizelySFDC - Info - Initial attempt to get SFDC object failed because of invalid session at Contact Check. Going to get a new one!');

            //Go get a new Token since it's expired  
            this.forceToken = true;
            this.goToFunction = "search2";
            this.getToken();
          }
          //We received an error message outside of Invalid Session
          else {
            //Debug Mode - Log to Console 
            this.consoleDebug("normal", 'OptimizelySFDC - Error - Contact check stopped because we recieved an error or object from SFDC that we did not expect (Done receieved)!');

            //Render the 1st screen again and show the message
            this.renderMessage("error", "Contact search stopped because of an unexpected error!");

          }

        });

      //End Search Contact Function
    },


    search3CheckLead: function(subInfo) {

      var subInformation = subInfo;

      //Function that checks to see if a lead exists, if so, find the owner and post to Chatter about that 
      //If so, then it gets the AE, SDR information
      //If not, proceed to serach2CreateLead

      //Debug Mode & Debug Object Mode - Log to Console
      this.consoleDebug("normal", 'OptimizelySFDC - Info - We did not find an account or contact with an account so we are searching for a lead!');

      //SFDC API URL to Get Lead information based on email of the requestoer
      var URLBase = this.APIBase + "query/?q=";
      var action = "Select+Id,OwnerId,SDR_Owner__r.FirstName,SDR_Owner__r.LastName,SDR_Owner__c,Status,Name,IsConverted+from+Lead+where+email ='" + this.TktEmail + "'";

      //Debug Mode & Debug Object Mode - Log to Console
      this.consoleDebug("object", 'Optimizely SFDC - API Call - ', URLBase + action);

      //If we already determined it was a qualified lead, then create a new one
      if (this.QualifiedLead === "Qualified") {
        this.renderNewLead();
        return;
      }

      //Make the request to get the SFDC Object - Lead 
      this.ajax('fetchSFDCObject', URLBase + action)
        .done(function(data) {
          //Debug Mode & Debug Object Mode - Log to Console
          this.consoleDebug("object", 'Fetch SFDC Fetch Lead Data Object: ', data);

          //Check to see if Data is Done and that TotalSize of Object is not 0
          if ((data.done) && (data.totalSize !== 0)) {

            if (data.records[0].SDR_Owner__r != null) {
              this.ChatterOwnerName = data.records[0].SDR_Owner__r.FirstName + " " + data.records[0].SDR_Owner__r.LastName;
            }
            ///Lead Successfully found.  Store info and resent Confirmation Screen
            this.ChatterRecordId = data.records[0].Id;
            this.ChatterOwnerId = data.records[0].SDR_Owner__c;
            //this.ChatterOwnerName = data.records[0].SDR_Owner__r.FirstName + " " + data.records[0].SDR_Owner__c.LastName;
            this.LeadName = data.records[0].Name;
            this.LeadStatus = data.records[0].Status;
            this.LeadConvertedStatus = data.records[0].IsConverted;

            //Debug Mode - Log to Console
            this.consoleDebug("normal", 'OptimizelySFDC - Info - Lead found, showing confirmation screen!');


            //Debug Mode & Debug Object Mode - Log to Console
            this.consoleDebug("normal", 'OptimizelySFDC - Data - Lead Objects Data Elements - ' + this.ChatterRecordId + ' ' + this.ChatterOwnerId);


            if (this.LeadStatus === "Sales Qualified Lead") {


              //Debug Mode - Log to Console
              this.consoleDebug("normal", "OptimizelySFDC - Info - Lead found but it's already qualified. Going to search for the account via contact.");

              this.QualifiedLead = "Qualified";
              this.search2CheckContact(subInformation);

            } else if (this.LeadConvertedStatus) {
              this.consoleDebug("normal", "OptimizelySFDC - Info - Lead found but is already converted. Going to search for the account via contact.");
              this.QualifiedLead = "Converted";
              this.search2CheckContact(subInformation);

            } else {
              //Render the Confirmation screen to present data back to the user
              this.RecordType = "Lead";
              this.renderConfirmation1("Step 1 - Lead Chatter Notification Options");
            }

          } else {

            //Debug Mode - Log to Console
            this.consoleDebug("normal", 'OptimizelySFDC - Info - We did not find the lead so we are going to create one!');

            //Create New Lead since we didn't find an existing one 
            this.renderNewLead();

          }


        });



    },

    ChatterConfirmation: function() {

      //Function used by the system to post to Chatter. This is called when the Agent confirms the Chatter Message


      //Get the Chatter Message from the box in case it was changed
      var RecordName = "";
      this.ChatterMessage = this.$('textarea[name="chattermessage"]').val();

      //Set the RecordName based on the type of Record (Account Name or Lead Name)
      if (this.RecordType === "Lead") {
        RecordName = this.LeadName;
      } else {
        RecordName = this.OrgName;
      }

      //Logic to post to Console during debug mode, or to post to Chatter
      //part 1 - Write to Console if setting is set
      if (this.debugChatter) {

        this.consoleDebug("normal", "OptimizelySFDC - Chatter Post - Post to " + this.RecordType + " Call not made to SFDC. Name = " + RecordName + "Record = " + this.ChatterRecordId + " where Owner = " + this.ChatterOwnerName);
        this.consoleDebug("normal", 'OptimizelySFDC - Info - Chatter Message  for ' + this.ChatterOwnerName + ': ' + this.ChatterMessage);

        //Render the 1st screen again and show the message
        this.renderMessage("Warning", "In Chatter debug mode, Chatter message not posted. It would've been posted in non-debug mode!");

      }

      //Part 2 - Post to Chatter and call the Ajax request to start taht
      else {

        //Debug Mode & Debug Object Mode - Log to Console
        this.consoleDebug("normal", "OptimizelySFDC - Chatter Post - Post Request to " + this.RecordType + " Name = " + RecordName + "Record = " + this.ChatterRecordId + " where Owner = " + this.ChatterOwnerName);
        this.consoleDebug("normal", 'OptimizelySFDC - Info - Chatter Message  for ' + this.ChatterOwnerName + ': ' + this.ChatterMessage);
        if (this.ChatterOwnerName == "Not Assigned. SDR Lead only will be notified") {
          this.ajax('postChatter_single')
            .done(function(data) {
              this.chatter_success(data, RecordName);
            })
            .fail(function(data) {
              this.chatter_failed(data, RecordName);
            });

        } else {
          this.ajax('postChatter')
            .done(function(data) {
              this.chatter_success(data, RecordName);
            })
            .fail(function(data) {
              this.chatter_failed(data, RecordName);
            });

        }
      }

    },


    chatter_success: function(data, RecordName) {

      //Look at the Chatter response to confirm it was success

      //Debug Mode & Debug Object Mode - Log to Console
      this.consoleDebug("object", 'Post Chatter SDFC Object: ', data);

      //Check to make sure an id is returned to confirm successful Chatter post 
      if (typeof data.id !== 'undefined' && data.id !== null) {

        //Debug Mode - Log to Console
        this.consoleDebug("normal", 'OptimizelySFDC - Success - Successfully posted on Chatter feed of ' + this.RecordType + 'Record was for ' + RecordName);
        this.consoleDebug("normal", 'OptimizelySFDC - Info - Chatter Message  for ' + this.ChatterOwnerName + ': ' + this.ChatterMessage);


        //Add information to the ticket
        var ticket = this.ticket();
        var currentDate = new Date();
        ticket.tags().add("salesnotified");
        var commentText = "Opty App - Internal Tracking Note - Sales Notified via Chatter. Record Link - " + this.SFDCinstance + "/" + this.ChatterRecordId + " Message - " + this.ChatterMessage + ". Posted by " + this.currentUser().name() + " at " + currentDate;
        var dataObject = {
          "ticket": {
            "comment": {
              "public": false,
              "body": commentText
            }
          }
        };
        var UserAPIURL = "/api/v2/tickets/" + this.ticket().id() + ".json";

        this.ajax('updateZendeskData', UserAPIURL, dataObject)
          .done(function(data) {
            //If in debug mode, write to console
            this.consoleDebug("object", 'ZD Ticket Update (Comment Update - New Lead):', data);

            //After successful update, update APP screen
            services.notify("Ticket Updated By Opty App - Internal Note for Lead Creation");
          })
          .fail(function(data) {
            this.consoleDebug("object", 'Error Updating Ticket for Sent Via:', data);
            services.notify("Error! Update to add ticket comment failed.");

          });


        //Render the 1st screen again and show the message
        this.renderMessage("Success", "Chatter Message Successfully posted!");
      } else {


        //Debug Mode - Log to Console
        this.consoleDebug("normal", 'OptimizelySFDC - Error - Error in posting on Chatter feed of ' + this.RecordType + 'Record was for ' + RecordName);

        //Render the 1st screen again and show the message
        this.renderMessage("Error", "Chatter Message not posted due to error");

      }

    },

    chatter_failed: function(data, RecordName) {

      //Debug Mode - Log to Console
      this.consoleDebug("normal", 'OptimizelySFDC - Error - Error in posting on Chatter feed of ' + this.RecordType + 'Record was for ' + RecordName);

      //Render the 1st screen again and show the message
      this.renderMessage("Error", "Chatter Message not posted due to error");


    },
    switchLeadCountry: function() {
      //function to switch the SDR Country from EU to US or US to EU. This changes the lead and updates the drop down


      if (this.$('#switchlead').text() === "Switch to EU Lead") {
        this.SDRLeadId = this.EULeadId;
        this.SDRLeadName = this.EULeadName;

        this.$('#switchlead').text("Switch to US Lead");
      } else {
        this.SDRLeadId = this.USLeadId;
        this.SDRLeadName = this.USLeadName;
        this.$('#switchlead').text("Switch to EU Lead");
      }


      this.$('#SDRLead').text(this.SDRLeadName);


    },

    cancelChange: function() {

      var editContainer = "";
      if (this.$('#switchlead').text() === "Switch to EU Lead") {
        editContainer = "#usSDR";
      } else {
        editContainer = "#euSDR";
      }

      this.$(editContainer).addClass('hide');
      this.$(editContainer).removeClass("show");
      this.$(editContainer).css({
        "display": "none"
      });
      this.$('#switchlead').removeClass("hide");
      this.$('#switchlead').addClass("show");
      this.$('#cancelSDR').removeClass("show");
      this.$('#cancelSDR').addClass("hide");

    },


    renderConfirmation1: function(ccheader) {
      //Function to render the confirmation chatter notification in the modal

      var RecordNameValue = "";
      if (this.RecordType === "Lead") {
        RecordNameValue = this.LeadName;
      } else {
        RecordNameValue = this.OrgName;
      }

      this.ChatterMessage = "<TYPE YOUR MESSAGE HERE. PLEASE INCLUDE AS MUCH CONTEXT AS POSSIBLE FOR THE SALES HUMAN/CSM>";
      if (this.ChatterOwnerName === '') {
        this.ChatterOwnerName = "No team assigned. Opener Lead only will be notified";
      }

      //Update section of confirmation page with update value
      this.$('.RecordType').text(this.RecordType);
      this.$('#ccheader').text(ccheader);
      this.$('#RecordId').text(this.ChatterRecordId);
      this.$('#RecordName').text(RecordNameValue);
      this.$('#RecordOwner').text(this.ChatterOwnerName);
      this.$('#SDRLead').text(this.SDRLeadName);
      this.$("textarea[name='chattermessage']").text(this.ChatterMessage);
      this.$('#csm').text(this.ChatterCSM);
      this.$('#ae').text(this.ChatterOpener);
      this.$('#opener').text(this.ChatterAE);

      //Show the correct buttons
      this.modalButtonReset();
      this.$('#postchatter').removeClass('hidden');
      this.$('#postchatter').addClass('shown');
      this.$('#switchlead').removeClass('hidden');
      this.$('#switchLead').addClass('shown');
      this.$('#leadcontinue').removeClass('shown');
      this.$('#leadcontinue').addClass('hidden');


      //Hide load and show confirmation screen
      this.$("#loading").addClass("hide");
      this.$("#loading").removeClass("show");
      this.$("#confirmation").addClass("show");
      this.$("#confirmation").removeClass("hide");
      this.sfdcmodal = "#confirmation";

    },

    renderMessage: function(type, message) {
      //Function to render message on the SFDC Modal

      //Hide current screen in modal and show message
      this.modalButtonReset();
      this.$(this.sfdcmodal).removeClass("show");
      this.$(this.sfdcmodal).addClass("hide");
      this.$("#showmessage").addClass("show");
      this.$("#showmessage").removeClass("hide");
      this.$('#closetext').text('Close');
      var spanClass = '';
      if (type === "Error") {
        spanClass = "Red";
      } else if (type === "Warning") {
        spanClass = "Orange";
      } else {
        spanClass = "Green";
      }

      this.$('#showmessage').html("<span class='" + spanClass + "'><b>" + type + "</b></span>: " + message);
      this.sfdcmodal = "#showmessage";

    },

    renderNewLead: function() {
      //Function to render New Lead on SFDC Modal

      var req_email = this.ticket().requester().email();
      console.log(req_email);


      //Show the correct buttons
      this.modalButtonReset();
      this.$('#createlead').removeClass('hidden');
      this.$('#createlead').addClass('shown');
      this.$('#loading').removeClass('shown');
      this.$('#loading').addClass('hidden');
      this.$('#newlead').removeClass('hide');
      this.$('#newlead').addClass('shown');
      this.$('#email_addy').attr("href","https://na28.salesforce.com/_ui/search/ui/UnifiedSearchResults?searchType=2&sen=a44&sen=a02&sen=a35&sen=a2S&sen=0F9&sen=a5x&sen=a4W&sen=a2x&sen=a2z&sen=00O&sen=001&sen=00Q&sen=003&sen=005&sen=a4j&sen=006&sen=a0J&sen=a5r&str=" + req_email);

      //this.$('#leadheader').text("No existing record found");

      this.sfdcmodal = "#newlead";


    },

    modalButtonReset: function() {

      console.log("Calling modalButtonReset");

      //Function to reset the SFDC modal buttons and screens
      this.$('#createlead').removeClass("shown");
      this.$('#createlead').addClass("hidden");
      this.$('#leadcontinue').removeClass("shown");
      this.$('#leadcontinue').addClass("hidden");
      this.$('#postchatter').removeClass("shown");
      this.$('#postchatter').addClass("hidden");
      this.$('#switchlead').removeClass("shown");
      this.$('#switchlead').addClass("hidden");
      this.$('#closetext').text('Cancel');


      if (this.store('countrysetting')) {
        this.$('#switchlead').text("Switch to US Lead");
        this.SDRLeadId = this.EULeadId;
        this.SDRLeadName = this.EULeadName;
        this.$('#SDRLead').text(this.SDRLeadName);
      } else {
        this.SDRLeadId = this.USLeadId;
        this.SDRLeadName = this.USLeadName;
        this.$('#switchlead').text("Switch to EU Lead");
        this.$('#SDRLead').text(this.SDRLeadName);
      }


    },

    modalCountry: function() {
      //Function to set Chatter Screen based on the users Country Setting

      if (this.store('countrysetting') === false) {
        this.$('#switchlead').text("Switch to EU Lead");
        this.SDRLeadId = this.USLeadId;
        this.SDRLeadName = this.USLeadName;
      } else {
        this.$('#switchlead').text("Switch to US Lead");
        this.SDRLeadId = this.EULeadId;
        this.SDRLeadName = this.EULeadName;
      }

      this.$('#usSDR').css({
        "display": "none"
      });
      this.$('#usSDR').addClass('hide');
      this.$('#euSDR').css({
        "display": "none"
      });
      this.$('#euSDR').addClass('hide');

    }

    //SFDC Opty App Functions End Here ------------------------------------------------------------------>



    //Things to do
    //Put logic to make sure org is present to check for org custom field. 
    //Logic to update user impersonation field upon save
    //Finish Change Recipient function - check to make sure it's an email
    //Integrate SFDC with this app via Modal
    //Change Recipeint - Add logic to run the logic when we first initialize the app. 
    //AppMessages Section - format, add cass rules to control color for success, fail

  };

}());
