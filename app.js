(function() {
  return {


//General Local Variables Start Here ------------------------------------------------------------------>

     LeadStatus:"Marketing Qualified Lead (MQL)",
     LeadSource:"Other",
     LeadCategory: "Contact Request",
     LeadSubCategory: "Zendesk Case",
     usSDRRoleID:"00EC000000132sfMAA",
     euSDRRoleID:"00EC0000001331oMAA",
     usEDRRoleID: "00EC000000133fBMAQ",
     euAERoleID:"00EC0000001349eMAA",



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
          updateZendeskData: function(URL,dataobject) {
                
                return {
                 
                  url: URL,
                  dataType: 'json',
                  type: 'PUT',
                  data: dataobject
                };
            },


//General Rquest Functions  End Here -------------------------------------------------------------------------------------->


//SFDC Opty App Requests Start Here ------------------------------------------------------------------>

fetchAccessToken: function(URL) {
                
                return {
                  url: URL,
                  type: 'POST',
                  dataType: 'json'
                };
            },

fetchSFDCObject: function(URL) {
                
                return {
                 
                  url: URL,
                  headers: {'Authorization':'OAuth '+this.store('SecurityToken')},
                  dataType: 'json',
                  type: 'GET'
                };
            },

postChatter: function() {
                
                return {
                 
                  url:   this.SFDCinstance+"/services/data/v23.0/chatter/feeds/record/"+this.ChatterRecordId+"/feed-items",
                  headers: {'Authorization':'OAuth '+this.store('SecurityToken')},
                  contentType: 'application/json',
                  type: 'POST',
                  data:  JSON.stringify({ 
                           "body" : 
                               { 
                               messageSegments : [ 
                                  { 
                                      type: "mention", 
                                       id : this.ChatterOwnerId
                                  },
                                  { 
                                      type: "mention", 
                                       id : this.SDRLeadId
                                  },
                                  { 
                                      type: "text", 
                                      "text" : this.ChatterMessage +' Notification By '+ this.currentUser().name()
                                  } 
                                   ]
                               }
                           
                           })
                };
            },

  postChatter_single: function() {
                
                return {
                 
                  url:   this.SFDCinstance+"/services/data/v23.0/chatter/feeds/record/"+this.ChatterRecordId+"/feed-items",
                  headers: {'Authorization':'OAuth '+this.store('SecurityToken')},
                  contentType: 'application/json',
                  type: 'POST',
                  data:  JSON.stringify({ 
                           "body" : 
                               { 
                               messageSegments : [ 
                                  { 
                                      type: "mention", 
                                       id : this.SDRLeadId
                                  },
                                  { 
                                      type: "text", 
                                      "text" : this.ChatterMessage +' Notification By '+ this.currentUser().name()
                                  } 
                                   ]
                               }
                           
                           })
                };
            },

    createLead: function() {
                
                return {
                 
                  url:   this.SFDCinstance+"/services/data/v20.0/sobjects/Lead/",
                  headers: {'Authorization':'OAuth '+this.store('SecurityToken')},
                  contentType: 'application/json',
                  type: 'POST',
                  data: JSON.stringify({ 
                           LastName: this.LeadLN,
                           FirstName: this.LeadFN,
                           LeadSource: this.LeadSource,
                           Company:this.LeadCompany,
                           Email: this.TktEmail,
                           Status: this.LeadStatus,
                           Lead_Source_Category__c: this.LeadCategory,
                           Lead_Source_Subcategory__c: this.LeadSubCategory
                        })
                };
            }







//SFDC Opty App Requests End Here ------------------------------------------------------------------>


},

events: {

//General Event Calls Start Here ------------------------------------------------------------------------------------>

      'app.activated':'initializeApp',
      'ticket.save':'SaveUpdates',
      'ticket.custom_field_21047815.changed':'updateImpersonate',
      'click #changerecipient':'changeRecipient',
      'click #btnSentVia':'showChangeRecipient',
      'click #saveSentVia':'updateRecipient2',
      'click #open-close':'toggleFromAddress',
      'click span.accountLinkHeader':'toggleAccountLinks',
      'click span.kbLinkHeader':'toggleKBLinks',
      'click #chatter_button':'sfdcGetInfo',
      'click #postchatter':'ChatterConfirmation',
      'click span.notesHeader':'toggleNotes',
      'click #createlead':'SFDCCreateLead',
      'click #leadcontinue':'LeadWait',
      'click #changeSDR':'changeSDR',
      'click #linksetting':'setLinkSetting',
      'click #countrysetting':'setCountrySetting',
      'click #switchlead':'switchLeadCountry',
      'click #sdrsave':'changeSDR',
      'click #cancelSDR':'cancelChange',
      'click #btnSendMobile':'changeRecipientMobile',
      'click a.validation':'validateExperimentId',
      'click a.notes_link':'toggleAccountNotes',
      'click #collaborator_button': 'openCollaborator',
      'click #collaborators li ul': 'addCollaborator',


//General Event Calls End Here -------------------------------------------------------------------------------------->

    
//SFDC Event Calls  Start Here -------------------------------------------------------------------------------------->
    'fetchAccessToken.error': function(data){
        this.consoleDebug("object",data);



    },


         
      'fetchAccessToken.done': function(data){
            this.consoleDebug("normal","Getting Here!");
            this.consoleDebug("object",data);
            var AccessToken = data.access_token.split('!')[1];

             //If in debug mode, write to console 
             this.consoleDebug("normal",'OptimizelySFDC - Success - Request to fetch Access Token Successful!');
             this.consoleDebug("object",'AccessToken Data Object:',data);

  
            //store the Security Token in the local storage
            this.store('SecurityToken', AccessToken); 

            
            //Check local storage to see if we forced the retrieval of the token. If so, return to the function that called the
            //force token
            if (this.forceToken){

                   //Check local Storage to see which function to go back to since we were forced to get an authentication
                   if (this.goToFunction === "search1"){ 
                     //If in debug mode, write to console 
                     this.consoleDebug("normal",'OptimizelySFDC - Success - Returning to check Account after getting Token');
                     this.search1CheckAccount();
                   }
                   else if (this.goToFunction==="getSDR"){
                     this.consoleDebug("normal",'OptimizelySFDC - Success - Returning to getSDR after getting Token');
                     this.getSDR("#usSDR");
                   } 
                    else {
                    //If in debug mode, write to console 
                    this.consoleDebug("normal",'OptimizelySFDC - Success - Returning to check Contact after getting Token');
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
      this.forceToken=false;
      this.goToFunction=" ";
      this.ChatterRecordId="";
      this.ChatterOwnerId="";
      this.ChatterOwnerName="";
      this.OrgId="";
      this.OrgName="";
      this.LeadName="";
      this.RecordType="";
      this.refresh_token= this.setting('refreshtoken');
      this.client_id= this.setting('clientid');
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
      this.SDRLeadName =this.setting('sdrleadname');
      this.EULeadName =this.setting('eusdrleadname');
      this.USLeadName =this.setting('sdrleadname');
      this.forceToken=false;

      //Get Security Token for Salesforce App
      this.getToken();

      
      //Get the basic ticket information to load the initial app home screen. 
      var currentTicket = this.ticket();
      var currentClient = currentTicket.requester();
      this.requesterID = currentTicket.requester().id();
      var imp_email = currentTicket.customField('custom_field_21047815')||'';

      //Adding impersonate by experiment id button
      var experimentId = currentTicket.customField('custom_field_22559284')||'';
      this.exp = experimentId;
      this.impersonation_link = "https://www.optimizely.com/admin/impersonate?experiment_id=" + this.exp + "&redirect=https://www.optimizely.com/edit?experiment_id=" + this.exp;

      //function to check if the ticket was sent to internal-support@ and change the Sent Via field to support@ if necessary
      this.checkIfInternal();

      //Get recipient email address to show on the home screen
      var UserAPIURL = "/api/v2/tickets/"+this.ticket().id()+".json";
      /*
      this.ajax('fetchZendeskData', UserAPIURL)
              .done(function(data) {
                this.consoleDebug("object","InitialUserObject:",data);
                 this.recipient = data.ticket.recipient || "support@optimizely.com";
                 this.$('#recipient').text(this.recipient);
                 console.log(currentTicket.customField('custom_field_21226130'),this.recipient);
                 if (currentTicket.customField('custom_field_21226130') !== this.recipient) {
                    console.log("running 1");
                    currentTicket.customField('custom_field_21226130',this.recipient);
                    this.ticket().save();
                 }
                 this.checkRecipient(true);
               })
              .fail(function(data){
                 this.consoleDebug("object","InitialUserObject Request Failed",data);
                 this.recipient= "support@optimizely.com";
                 this.$('#recipient').text(this.recipient);
                 if (currentTicket.customField('custom_field_21226130') !== this.recipient) {
                    console.log("running 2");
                    currentTicket.customField('custom_field_21226130',this.recipient);
                 }
                 this.checkRecipient(true);
              });
        */

      //If the impersonation email is blank, then check the impersonation email at the user level. If that is empty, check it at the org level
      //Sets the user email used for the impersonate button, and updates the ticket impersonate field 
      if (imp_email.trim() ==="" || imp_email==="null"){

            //Get the IMpersanation field at the User Level
            UserAPIURL = "/api/v2/users/"+this.requesterID+".json";
            this.ajax('fetchZendeskData', UserAPIURL)
                .done(function(data) {
                  //Write to console when in debug mode
                  this.consoleDebug("object",'ZD User Object (Check Impersonation):',data);
                  
                  //Look at User Impersonation field. If not blank, then set as override Email. If Blank, check Org Impersonation field
                  imp_email= data.user.user_fields.impersonation_email ||'';

                  //If imp_email is not empty, then update the userEmail and set the customField. Else get check the org to see if the custom field is set there
                  
                  if (imp_email.trim ==='' || imp_email===null){
                    this.userEmail=imp_email.trim();
                    currentTicket.customField('custom_field_21047815', imp_email);
                  }
                  else {
                         //Get the User Impersonation field at the Org Level
                         var UserAPIURL = "/api/v2/users/"+this.requesterID+"/organizations.json";
                         this.ajax('fetchZendeskData', UserAPIURL)
                            .done(function(data) {
                                 //Write to console when in debug mode
                                 this.consoleDebug("object",'ZD Group Object:',data);

                               //Check to make sure Organization Exists, if it doesn't then proceed to loading the app without updating anything
                               if (data.count >0){
                                   imp_email= data.organizations[0].organization_fields.impersonation_email ||'';
                                   if (imp_email !==''|| imp_email ===null){
                                      this.userEmail = imp_email;
                                      currentTicket.customField('custom_field_21047815',imp_email);
                                      this.AppInitialized();
                                   }
                                   else {
                                     //If impersonation email is empty at org, then use the existing users email for impersonation
                                     this.userEmail = currentClient.email();
                                     this.AppInitialized();
                                   }

                                }
                                else {
                                  //If the org data isn't returned, then assume the field is empty and use the existing users email for impersonation
                                  this.userEmail = currentClient.email();
                                  this.AppInitialized();
                                }
                              
                               });
                   }  

            });
      }
      else {
        //If it wasn't null or empty, then set the impersonation field as the userEmail
        this.userEmail = imp_email.trim();
        this.AppInitialized();
      }

     },
                              


     AppInitialized: function(){
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
      if((typeof experimentId == "number") && (experimentId.toString().length > 4)) {
        this.link8 = "href=https://app.optimizely.com/s/do/redirect-to-impersonate?input="+experimentId;
        this.link9 = "href=https://app.optimizely.com/admin/impersonate?experiment_id="+experimentId+"&redirect=%2Fresults%3Fexperiment_id%3D"+experimentId;
        this.link10 = "href=https://app.optimizely.com/s/experiment_export/"+experimentId;
      }
      else {
        this.link8 = "";
        this.link9 = "";
        this.link10 = "";
        this.msg = 'No valid experiment id found!';
      }

     
      //Load Main screen
      this.switchTo('list', { link1: this.link1, link8: this.link8, link9: this.link9, link10: this.link10, recipient: this.recipient});
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
        this.$('#linksetting').prop('checked',true);
        this.toggleLinks();
      }

      if (this.store('countrysetting')) {
        this.$('#countrysetting').prop('checked',true);
      }

      //Get SDR Users for the SFDC App for US & EU
      this.getSDR("#usSDR"); this.getSDR("#euSDR");

     //[Account notes functionality] gather account information to make available for TSRs 
      this.getAccountInfo();
         
     },

    validateExperimentId: function(){
      //validate experiment id [workaround]
      if(this.msg){
        services.notify(this.msg, 'error', 2000);
      }
    },

    toggleFromAddress: function(){
      
      //Logic to toggle the Change From Address form
      if (this.$('.fromAddressLinkHeader i.icon-plus').length===0){
        this.$('.fromAddressLinkHeader i').attr('class', 'icon-plus');
      } else {
        this.$('.fromAddressLinkHeader i').attr('class', 'icon-minus');
      }
        return this.$('#form_options').slideToggle();
      },


    toggleAccountLinks: function(){
      
//      //Logic to toggle the Account Lookup Links
//      if (this.$('.accountLinkHeader i.icon-plus').length===0){
//        this.$('.accountLinkHeader i').attr('class', 'icon-plus');
//      } else {
//        this.$('.accountLinkHeader i').attr('class', 'icon-minus');
//      }
        return this.$('section[data-links]').slideToggle();
      },

      toggleKBLinks: function(){
  
              return this.$('#articleWrapper').slideToggle();
      },

      toggleNotes: function(){
  
              return this.$('#notesWrapper').slideToggle();
      },
      
      /*-- Allows for toggling bewtween subscription and contact levels --*/
      
      toggleAccountNotes: function() {
        if(this.$("a.subscription").hasClass("selected")) {
                this.$("a.subscription").removeClass("selected");
                this.$("#subscription_notes").addClass("hide");
                this.$("a.contact").addClass("selected");
                this.$("#contact_notes").removeClass("hide");
            }
            else {
                this.$("a.contact").removeClass("selected");
                this.$("#contact_notes").addClass("hide");
                this.$("a.subscription").addClass("selected");
                this.$("#subscription_notes").removeClass("hide");
            }
      },

      openCollaborator: function() {
        if(this.$("#collaborators").hasClass("hide")) {
            this.$("#collaborators").removeClass("hide");
            }
        else {
          this.$("#collaborators").addClass("hide");
            }
      },

      addCollaborator: function(element) {

        // Adds a tag with the collaborator's name
        ticket = this.ticket();
        tags = ticket.tags();
        TSE_NAME = "collaborator_" + element.toElement.innerHTML.toLowerCase().split(" ").join("_");
        tags.add(TSE_NAME);
      },

    updateImpersonate:function(){
    //function to update the impersonate email when the user changes it
    
    var imp_email='';
    if (this.ticket().customField('custom_field_21047815')===''){
      imp_email=this.ticket().requester().email();
    }
    else {
       imp_email = this.ticket().customField('custom_field_21047815');
    }
    this.$('#impersonate').attr("href","https://www.optimizely.com/admin/impersonate?email=" + imp_email + "&redirect=https://www.optimizely.com/dashboard");
    
    },
    changeRecipientMobile:function(){
      //Function to change the change via to Mobile Support 

      this.$("#newRecipient").val("mobile-support@optimizely.com");
      this.updateRecipient2();

    },
    checkIfInternal:function(){
      console.log("checking if from internal");
      //Function to change the change messages from internal-support to support 
      if (this.ticket().customField('custom_field_21226130')==='support-internal@optimizely.com') {
        console.log("ticket from internal - switching recipient to support@");
        this.$("#newRecipient").val("support@optimizely.com");
        this.updateRecipient2('internal');
      }
    },
    updateRecipient2:function(usertype){
      //Function that is fired off to change the Recipient (Sent Via Field). This is fired off by when the ticket is first opened, when the group is changed with the ticket open, or by a user asking to change it via the update button
      //The system will check to make sure the recipient email is set to support@optimizely.com if the ticket group is not TAM. Updates are only made if the ticket is not closed
      //System initiatied checks will come in with a usertype parameter set to System
       var ticketStatus = this.ticket().status();
       if (ticketStatus !=="closed"){

        //set local variables
        var user ="";
        var newemail="";
        var runAPI= false;
        var oldemail =this.recipient;
        var currentDate = new Date();

        
        //check the user and define local variables
        if (usertype==="system"){
           user ="OptyApp (System Check)";
           newemail="support@optimizely.com";
        }
        if (usertype==="internal"){
          user =this.currentUser().name();
          newemail=this.recipient= "support@optimizely.com";
          runAPI=true;
        }
        else {
          user =this.currentUser().name();
          newemail=this.recipient= this.$("#newRecipient").val();
        }

        if (usertype!=="system"){
          runAPI=true;
        }
     
        if(runAPI){
              //Code to update the ticket with a comment for tracking purposes. 
              var commentText = "Opty App - Internal Tracking - Recipient Changed from " + oldemail + " to "+ newemail +" by "+ user + " at " + currentDate;
              var dataObject = {"ticket":{"recipient": newemail, "comment":{"public":false, "body": commentText}}};
              var UserAPIURL = "/api/v2/tickets/"+this.ticket().id()+".json";

         this.ajax('updateZendeskData',UserAPIURL,dataObject)
                    .done(function(data){
                     
                     //If in debug mode, write to console
                     this.consoleDebug("object",'ZD Ticket Update (Recipient Update):',data);

                     //After successful update, update APP screen   
                      this.recipient=newemail;
                      this.$('#recipient').html(this.recipient);
                      if (this.ticket().customField('custom_field_21226130') !== this.recipient) {
                        console.log("running 3",this.ticket().customField('custom_field_21226130'),this.recipient);
                        this.ticket().customField('custom_field_21226130',this.recipient);
                      }
                      if (usertype!=="system"){
                        this.$('#appModal').modal("hide");
                      }
                       services.notify("Ticket Updated- Sent Via field updated to "+this.recipient);
                    })
                    .fail(function(data){
                      this.consoleDebug("object",'Error Updating Ticket for Sent Via:',data);
                      services.notify("Error! Update to Sent Via Field Failed. Tried to change from  "+oldemail+ " to "+newemail);

                      if (usertype!=="system"){
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

    checkRecipient:function(initialize){
          //function that is run to check the recipient via a system check. It runs the function above with a parameter
          //No longer needed
          //this.updateRecipient2("system");

    },
    SaveUpdates: function(){
         //Function to run code when the Ticket is saved (user hits Submit)
         
       if (this.ticket().customField('custom_field_21047815') !=='' && this.ticket().customField('custom_field_21047815') !==null && this.ticket().customField('custom_field_21047815') !=='null') {
         this.consoleDebug("normal","OptyApp - Save ticket requested. Going to update impersonation field");
         //Update Impersonation Email at User Level upon ticket save
         var dataObject = {"user":{"user_fields": {"impersonation_email": this.ticket().customField('custom_field_21047815')}}};
         var UserAPIURL = "/api/v2/users/"+this.requesterID+".json";
                         this.ajax('updateZendeskData', UserAPIURL, dataObject)
                            .done(function(data) {
                                                    
                                 //If in debug mode, write to console
                                 this.consoleDebug("object",'ZD User Update (Impersonation Email):',data);
                            });
        return true;
      }
      else {
        return true;
      }
    },


    showChangeRecipient: function(){

      //Populate the modal with the necessary information by adding classes and updating titles
      this.$('#newRecipient').attr('value',this.recipient);
      this.$('#modalHeader').text("Update Sent Via (Optimizely Recipient)");
      this.$('#SentVia').removeClass("hide");
      this.$('#SentVia').removeClass("show"); 
  

    },


    setLinkSetting: function(){
      
      //Function to change the local storage variables when a user updates the "Account Links Expanded option"
      if (this.$('#linksetting:checked').length >0) {
        this.store('linksetting',true);
      }
      else {
         this.store('linksetting',false);
      }

      //check to see if the linksetting setting in the cookie is true, if so, open the Account links if it isn't set.
      if (this.store('linksetting') && this.$('.LinkHeader i.icon-minus').length===0) {
            this.toggleLinks();
      }

    },

    setCountrySetting: function(){
      
      //Function to change the local storage variables when a user updates the "Account Links Expanded option"
      if (this.$('#countrysetting:checked').length >0) {
             this.store('countrysetting',true);
      } 
      else {
         this.store('countrysetting',false);
      }

    },


   consoleDebug: function(type, message, data){

    //Generic function to write to the console for debugging purchases 
    if (type==="normal"){
      if (this.debugmode){console.log(message); }     

    }
    else {
      if (this.debugmode &&this.debugobjects) { console.log(message); console.log(data); }
    }
    
   },


//General App Functions End Here ------------------------------------------------------------------>


//SFDC Opty App Functions Start Here ------------------------------------------------------------------>

        getToken: function(){
          
          //Function to get the SFDC Token. The token is stored in the Local Storage ZD Cookie so we only have to get it if it's not there or expired. 
          //Check to see if it's expired, is not made until the initial SFDC request is made
          this.sfdcmodal="#loading";
    
          //Build the URL for the SFDC API Call
          var URLBase= this.SFDCinstance+"/services/data/v23.0/";
          this.APIBase = URLBase;

          //Check to see if we already have an AccessToken in the LocalStorage. If it's empty, get a new one
          if(this.store('SecurityToken') ===null || this.forceToken) {
                var URL ="https://login.salesforce.com/services/oauth2/token?grant_type=refresh_token&client_id="+this.client_id+"&client_secret="+this.client_secret+"&refresh_token="+this.refresh_token;
                this.consoleDebug("normal",URL);
                this.ajax('fetchAccessToken', URL);
          }
          else {    
             //Debug code
             this.consoleDebug("normal",'OptiimzelySFDC - Success - Security Token already retrieved, no need to get it again.');
          }
          //End of getTokenFunction
      },
      
        getAccountInfo: function () {
             
             //Function that is called when the app is initialized 
             //This is the same as sfdcGetInfo except for when it is initialized and what information is captured
             //Function will get the ticket information, and look up the Organization information using the Zendesk API. 
             //When an org is found, the app goes to the search for Account Function. If it isn't, it goes to the search for Contact function

             //Set Ticket Information into variables and store them into local storage
             var currentTicket = this.ticket();
             this.TktEmail = currentTicket.requester().email();
             this.TktName = currentTicket.requester().name();
             this.TktUserId = currentTicket.requester().id();
             this.TktSubject = currentTicket.subject();

             console.log("normal","getAccountInfo - Info - Basic Ticket Information -  Email= "+this.TktEmail +"; Name = "+this.TktName+"; UserID= "+this.TktUserId+"; Org="+this.OrgName);

             //Use the Zendesk API to get the Org data
             //example URL: https://optimizely.zendesk.com/api/v2/users/1070462067/organizations.json
             var OrgAPIURL = "/api/v2/users/"+this.TktUserId+"/organizations.json";
             this.ajax('fetchZendeskData', OrgAPIURL)
                .done(function(data) {
                  
                  //Function that processes the request after the API call to Zendesk is made

                  //Debug Mode & Debug Object Mode - Log to Console
                  console.log("object",'Fetch Zendesk Org Data Object: ',data);
     
                  //Pass data to local variables
                      this.orgId=data.organizations[0].organization_fields.id;
                      this.accountName=data.organizations[0].name;
                      this.csm=data.organizations[0].organization_fields.zendesk_assigned_csm;
                      this.subscriptionMrr=data.organizations[0].organization_fields.subscription_mrr;
                      this.renewal=data.organizations[0].organization_fields.subscription_start_date;
                      this.solutionsPartner=data.organizations[0].organization_fields.partner_name;
                      this.accountMrr=data.organizations[0].organization_fields.account_mrr;
                      this.orgDetails=data.organizations[0].details;
                 //based on the 'High-Risk Account' checkbox at the org level
                      //data.organizations[0].churn_risk === true ? this.churnRisk='yes' : this.churnRisk='no';
                    if (data.organizations[0].churn_risk === true){
                        this.churnRisk='yes';
                    }
                    else {
                        this.churnRisk='no';
                    }
                      //this.churnRisk=data.organizations[0].churn_risk;
                      this.subscription_id=data.organizations[0].organization_fields.subscription_id;


             //End get org information
             });
            
            //Use the Zendesk API to get the Contact data
            //example URL: https://optimizely.zendesk.com/api/v2/users/1070462067/organizations.json
             var UserAPIURL = "/api/v2/users/"+this.TktUserId+".json";
             this.ajax('fetchZendeskData', UserAPIURL)
                .done(function(data) {
                  
                  //Function that processes the request after the API call to Zendesk is made

                  //Debug Mode & Debug Object Mode - Log to Console
                  console.log("object",'Fetch Zendesk contact Data Object: ',data);
     
                  //Pass data to local variables
                    this.contactName=data.user.name;
                    this.timeZone=data.user.time_zone;
                    this.phone=data.user.user_fields.user_phone_number;
                    this.developerCertified=data.user.user_fields.developer_certified_user;
                    this.platformCertified=data.user.user_fields.platform_certified_user;
                    this.recentTickets=data.user.user_fields.tickets_closed_this_month;
                    this.userDetails=data.user.details;
                    this.zendesk_salesforce_contact_id=data.user.user_fields.zendesk_salesforce_contact_id;


             //End get contact information
             });
            
            
               //Set default Salesforce links to the overview pages for contacts, accounts and subscription
              var orgUrl = "https://c.na28.visual.force.com/apex/Skuid_SubscriptionsTab?save_new=1&sfdc.override=1";
              var accUrl = "https://c.na28.visual.force.com/apex/Skuid_AccountsTab?save_new=1&sfdc.override=1";
              var userUrl = "https://c.na28.visual.force.com/apex/Skuid_ContactsTab?save_new=1&sfdc.override=1";

              // If we have the contact id, account id or subscription id, update the links to go directly to this record
              if (this.subscription_id !== undefined) {
                orgUrl = "https://c.na28.visual.force.com/apex/Skuid_SubscriptionDetail?id=" + this.subscription_id + "&sfdc.override=1";
              }
              if (this.orgId !== undefined) {
                accUrl = "https://c.na28.visual.force.com/apex/Skuid_AccountDetail?id=" + this.orgId + "&sfdc.override=1";
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
                        
             //function to format the renewal date
             var formatRenewalDate = function(renew){
                var newDate = new Date(renew);
                var newDateString = newDate.toDateString();
                var final = newDateString == 'Thu Jan 01 1970' || newDateString == 'Invalid Date' ? '' : newDateString;
                return final;
             };
                //format renewal date before rendering template
                this.formattedRenewal = formatRenewalDate(this.renewal);

            
                this.$('section[account-notes]')
                    .html(this.renderTemplate('accountInfo', {
                        accountName: this.accountName,
                        csm: this.csm,
                        subscriptionMrr: this.subscriptionMrr,
                        accountMrr: this.accountMrr,
                        renewal: this.formattedRenewal,
                        solutionsPartner: this.solutionsPartner,
                        churnRisk: this.churnRisk,
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

            
            
        //End getAccountInfo function
        },


      sfdcGetInfo: function () {
             
             //Function that is called when the user hits the "Post to Chatter"
             //Function will get the ticket information, and look up the Organization information using the Zendesk API. 
             //When an org is found, the app goes to the search for Account Function. If it isn't, it goes to the search for Contact function
    
             //Reset Modal Buttons to Default State
             this.modalButtonReset();
             this.modalCountry();

             //Hide all other divs in modal
             this.$("#confirmation").addClass("hide"); this.$("#confirmation").removeClass("show");
             this.$("#newlead").addClass("hide"); this.$("#newlead").removeClass("show");
             this.$("#leadconf").addClass("hide"); this.$("#leadconf").removeClass("show");

             //Show loading screen
             //this.$(this.sfdcmodal).removeClass("show"); this.$(this.sfdcmodal).addClass("hide");
             this.$("#loadingheader").text("The system is looking up the requester in Salesforce via a Account, Contact, or Lead");
             this.$("#loading").addClass("show"); this.$("#loading").removeClass("hide");
             this.sfdcmodal="#loading";

             //Clear Variables
             this.ChatterRecordId=""; this.chatterOwnerId=""; this.ChatterOwnerName=""; this.LeadName=""; this.LeadLN=""; this.LeadFN=""; this.LeadCompany=""; this.RecordType="";this.ChatterMessage=""; 

             //Set Ticket Information into variables and store them into local storage
             var currentTicket = this.ticket();
             this.TktEmail = currentTicket.requester().email();
             this.TktName = currentTicket.requester().name();
             this.TktUserId = currentTicket.requester().id();
             this.TktSubject = currentTicket.subject();

             //Debug Mode - Log to Console
             this.consoleDebug("normal",'OptimizelySFDC - Success - Zendesk Information Retrieved and stored in local storage ');
             this.consoleDebug("normal","OptimizelySFDC - Info - Basic Ticket Information -  Email= "+this.TktEmail +"; Name = "+this.TktName+"; UserID= "+this.TktUserId+"; Org="+this.OrgName);

             //Use the Zendesk API to get the Org, after you get the Org, check to see if it exists in SF
             var UserAPIURL = "/api/v2/users/"+this.TktUserId+"/organizations.json";
             this.ajax('fetchZendeskData', UserAPIURL)
                .done(function(data) {
                  
                  //Function that processes the request after the API call to Zendesk is made

                  //Debug Mode & Debug Object Mode - Log to Console
                  this.consoleDebug("object",'Fetch Zendesk Org Data Object: ',data);
     
                  //Check to see if an Org was returned. If it isn't then go straight to check #2
                  //Treat an empty data return, or orgs with gmail.com, yahoo.com, hotmail.com, outlook.com as no org
                  if (data.count === 0 || (data.organizations[0].domain_names=="gmail.com" ||data.organizations[0].domain_names=="yahoo.com" ||data.organizations[0].domain_names=="hotmail.com" || data.organizations[0].domain_names==="outlook.com") ){
                      
                      //If no org found, go directly to looking for the Contact in SFDC
                      this.search2CheckContact();

                      //Debug Mode - Log to Console
                      if (data.count===0) {
                          this.consoleDebug("normal",'OptimizelySFDC - Info - Bypassed check on Account because Zendesk didn\'t return an organization for the user');
                      }
                      else {
                         this.consoleDebug("normal",'OptimizelySFDC - Info - Bypassed check on Account because Zendesk org domain matched a generic email domain (eg gmail, yahoo, optimizely, etc)');
                      }
                  }

                  else {

                    //If Org is found, pass that to local variables, and call the Search Account Function 
                    this.OrgId= data.organizations[0].id;
                    this.OrgName=data.organizations[0].name;

                    //Debug Mode - Log to Console
                    this.consoleDebug("normal",'OptimizelySFDC - Info - Starting SFDC Check on Account ');
              
                   //StartCheck by going to search1CheckAccount
                   this.search1CheckAccount();
                  }
                  
                                
                });

  
            //End sfdcGetInfo function

        },

       getSDR: function (country){
       //function to get the all of the SDR names

          var roleIDs="";
          if (country==="#usSDR"){
               roleIDs="'"+this.usSDRRoleID+"','"+this.usEDRRoleID+"'";
            }
          else {
              roleIDs="'"+this.euSDRRoleID+"','"+this.euAERoleID+"'";
          }

           var URLBase = this.APIBase+"query/?q=";
           var action = "SELECT+Id,Name,Alias+from+User+where+UserRoleId+IN+(" +roleIDs +")";

           this.ajax('fetchSFDCObject',URLBase+action)
           .done(function(data){
            this.consoleDebug("object","SDR User Object ("+country+")",data);

             
             for (var i=0;i<data.totalSize;i++){
                this.$(country).append("<option value='"+data.records[i].Id+"'>"+data.records[i].Name+"</option>" );
             }

           })
           .fail(function(data){
              this.consoleDebug("object","SDR User Request Failed",data);
               if (data.statusText.trim()==="Unauthorized"){
                           this.consoleDebug("normal",'OptimizelySFDC - Info - Initial attempt to get SFDC User object failed because of invalid session at Account Check. Going to get a new one!');

                            //Go get a new Token since it's expired 
                            this.forceToken= true;
                            this.goToFunction ="getSDR";
                            this.getToken();
                      } 
           });
      
       },



       search1CheckAccount: function(){

        //Function that looks up the Account in SFDC. 
        //If it exists at any point, then it goes to next function to search for Contact (search2CheckContact)


        //Debug Mode - Log to Console
        this.consoleDebug("normal",'OptimizelySFDC - Info - In search Account function ');

        //Set SFDC API URL for Account Search
        var AccountName= this.OrgName.replace("!","%21").replace("#","%23").replace("$","%24").replace("%","%25").replace("&","%26").replace("'","%27").replace("(", "%28").replace(")","%29").replace("*","%2A").replace("+","%2B").replace("-","%2D").replace("/","%2F").replace("~","%7E");
        var URLBase = this.APIBase+"query/?q=";
        var action = "SELECT+Id,Owner.Name,OwnerId,Account_Plan_Derived__c,recurly__Subscriber__c+FROM+Account+WHERE+Name='"+ AccountName +"'";
      
        //Debug Mode & Debug Object Mode - Log to Console
        this.consoleDebug("object",'OptimizelySFDC - API Call -',URLBase+action);

        //Start Ajax Request to SFDC to get Account. After a successful request, check the data returned
        this.ajax('fetchSFDCObject',URLBase+action)
           .done(function(data){
                  //Debug Mode & Debug Object Mode - Log to Console
                  this.consoleDebug("object",'Fetch SFDC Fetch Account Data Object: ',data);
         
                 //SFDC Check 1 - If Data exists, look at what data is inside.
                 if (data.done===true) {
                                 
                       //Debug Mode - Log to Console
                      this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Data Object had DONE record');

                      //Check to make sure there is a record returned
                      if (data.totalSize !== 0){  
                            //Debug Mode - Log to Console
                            this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Found that Data object has Account ID!');
                            
                            //Get the Plan Type and Subscriber from the data rerturned. 
                             var PlanType =data.records[0].Account_Plan_Derived__c;
                             var Subscriber = data.records[0].recurly__Subscriber__c;
                       
                            //Data check, make sure the account is subscribed. If they aren't send it to the Lead check
                            if (Subscriber){
                                   
                                   //Debug Mode - Log to Console
                                   this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account was found that was active. ');
                               
                                //Data check, make sure the account is Gold, Platinum, Agency 
                                if (PlanType==="platinum"|| PlanType==="gold" || PlanType==="agency") { 

                                   //Debug Mode - Log to Console
                                   this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account found was Gold, Platinum, or Agency. Chatter request should go to AE');
                            
                                   //Account is subscribed, and plan is Platinum, Agency, Gold so store data into Chatter variables 
                                   this.ChatterRecordId=data.records[0].Id;
                                   this.ChatterOwnerId=data.records[0].OwnerId;
                                   this.ChatterOwnerName=data.records[0].Owner.Name;

                                  //Change the screen to show the Chatter message post before going forward
                                  this.RecordType="Account";
                                  this.renderConfirmation1("Step 1 - Account Chatter Notification Options");
                                  //End check if plan type
                              }  

                              else {
                                   
                                   //Account was found, but it was not a platinum, gold, or agency account. Check for lead and go from there. 
                                   //If in debug mode, write to console 
                                  this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account was found but it was not Gold, Platinum, or Agency. Business Rules say search for Lead');                                
                                  
                                  //Call function to check for Lead
                                  this.search3CheckLead();
                             }
                             //End check on subscriber
                          } 
                          else {
                              //Account is not subscribed, look for the person as a lead
                                   //Debug Mode - Log to Console
                                   this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account was found but it was not active. Business Rules say to search for Lead');                                 
                                  
                                  //Call function to check for Lead
                                  this.search3CheckLead();
                          }
                      }
                      
                      //SFDC Object doesn't have Account ID, so there was an error in the search. Log to console and start Contact Record search
                      else {
                           //Debug Mode - Log to Console
                           this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account was not found, proceeding to contact search!');                                 
                               
                          //Call function to check for Lead
                          this.search3CheckLead();
                      }
                //End check on Data=Done 
                }
                  
                
                //If we recieved done object but it's not true, assume there is another error
                else {
                     //Debug Mode - Log to Console
                     this.consoleDebug("normal",'OptimizelySFDC - Error - Bypassed the Account check because it didn\'t return error or expected object!');                                 

                    //Proceed to check via Contact since we got unexpected error
                    this.search2CheckContact();
                }
                })

            .fail(function(data){
               //Function to handle a failed request to SFDC
               //Check to see if reason data was not returned is because of an invalid session

               this.consoleDebug("object","OptySFDC - CheckContactFailed Object:",data);

                      if (data.statusText.trim()==="Unauthorized"){
                       
                           this.consoleDebug("normal",'OptimizelySFDC - Info - Initial attempt to get SFDC object failed because of invalid session at Account Check. Going to get a new one!');

                            //Go get a new Token since it's expired 
                            this.forceToken= true;
                            this.goToFunction ="search1";
                            this.getToken();
                      } 
                      //We received an error message outside of Invalid Session
                      else {
                           //Debug Mode - Log to Console 
                           this.consoleDebug("normal",'OptimizelySFDC - Error - Account check stopped because we recieved an error or object from SFDC that we did not expect (Done receieved)!');
                          
                          //Render the 1st screen again and show the message
                          this.renderMessage("error", "Account search stopped because of an unexpected error!");
                        
                      }

           });

       },


      search2CheckContact: function(){

        //Function that checks to see if an contact exits and if they roll up to an account. If they do, do the same as Search 1
        //If so, then it gets the AE, SDR information
        //If not, proceed to serach3CheckLead

        //Debug Mode - Log to Console
        this.consoleDebug("normal",'OptimizelySFDC - Info - In search Contact function ');

        //Set SFDC API URL for Contact Search
        var URLBase = this.APIBase+"query/?q=";
        var Contact = this.TktEmail.replace("#","%23").replace("$","%24").replace("%","%25").replace("&","%26").replace("'","%27").replace("(", "%28").replace(")","%29").replace("*","%2A").replace("+","%2B").replace(",","%2C").replace("-","%2D").replace("/","%2F").replace("~","%7E");
        var action = "SELECT+Contact.Account.Id,Contact.Account.Name,Contact.FirstName,Contact.LastName,Contact.Account.OwnerId,Contact.Account.Owner.Name,Contact.Account.Account_Plan_Derived__c,Contact.Account.recurly__Subscriber__c+FROM+Contact+WHERE+email='"+ Contact +"'";
 
         //Debug Mode & Debug Object Mode - Log to Console
        this.consoleDebug("object",'Optmiizely SFDC - API Call -  ',URLBase+action);

        //Make the Call to get the SFDC Contact via API
        this.ajax('fetchSFDCObject',URLBase+action)
          .done(function(data){
                //Debug Mode & Debug Object Mode - Log to Console
                this.consoleDebug("object","Fetch SFDC Fetch Contact Data Object:",data);
    
               
                //SFDC Check 1 - If Data exists, look at what data is inside.
               if (data.done ===true) {
                     //Debug Mode - Log to Console 
                      this.consoleDebug("normal",'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Found that Data object had DONE Object');

                       //Verify that the data returned has account returned
                       if ((data.totalSize !== 0) && (data.records[0].Account !== null)){
                           
                             
                             //Get the Plan Type and Subscriber from the data rerturned. 
                             var PlanType =data.records[0].Account.Account_Plan_Derived__c;
                             var Subscriber = data.records[0].Account.recurly__Subscriber__c;

                             //Data check, make sure the account is subscribed. If they aren't send it to the Lead check
                             if (Subscriber){
                                   
                                   //Debug Mode - Log to Console 
                                   this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account -  SFDC Data Returned - Account was found that was active. ');

                                   //Check to see if the account is Gold, Platinum, or Agency. 
                                   if (PlanType==="platinum"|| PlanType==="gold" || PlanType==="agency") { 


                                   this.ChatterRecordId=data.records[0].Account.Id;
                                   this.ChatterOwnerId=data.records[0].Account.OwnerId;
                                   this.OrgName=data.records[0].Account.Name;
                                   this.ChatterOwnerName=data.records[0].Account.Owner.Name;

  
                                    //Render the Confirmation screen to present data back to the user
                                    this.RecordType="Account";
                                    this.renderConfirmation1("Step 1 - Account Chatter Notification Options");

                                  }
                              
                                  else {
                                      //Account was found, but it was not a platinum, gold, or agency account. Check for lead and go from there. 
                                      //Debug Mode - Log to Console     
                                      this.consoleDebug("normal",'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Account was found but it was not Gold, Platinum, or Agency. Business Rules say search for Lead');                              
                                      
                                      if (this.QualifiedLead==="Qualified" || this.QualifiedLead==="Converted"){

                                          this.consoleDebug("normal",'OptimizelySFDC - Info- Search Contact -  SFDC Data Returned - Account was found but it was not Gold, Platinum, or Agency. Business rules overriden since it is an already qualified lead');                              

                                          //Render the Confirmation screen to present data back to the user
                                         this.ChatterRecordId=data.records[0].Account.Id;
                                         this.ChatterOwnerId=data.records[0].Account.OwnerId;
                                         this.OrgName=data.records[0].Account.Name;
                                         this.ChatterOwnerName=data.records[0].Account.Owner.Name;

                                          this.RecordType="Account";
                                          this.renderConfirmation1("Step 1 - Chatter Notification Options"); 
                                      }
                                      else {

                                       //Look for the Lead since the account was subscribed but not platinum, gold, agency
                                       this.search3CheckLead();
                                      }


                              }
                             //End check for Subscriber
                             }

                             //If not a subscribed account, then look for the account as a lead
                             else {
                                   this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account via Contact -  SFDC Data Returned - Account was found but it was not active. Business Rules say to search for Lead');                              
                                  
                                  //Look for Lead
                                  this.search3CheckLead();
                              }
                       //End check that data has been returned
                       }
                       
                       //Data object had Done record, but it didn't have an account associated to the contact. look for a lead
                       else {
                             this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account via Conact-  SFDC Data Returned - Contact did not have an account record ');                              
                                  
                            //Check to see if this contact search came from the qualified sales lead. If it is, then go to great a lead to prevent an infinite loop 
                            //set internal variable to prevent infinite loop that goes from Lead to Contact and back to Lead
                            if (this.QualifiedLead==="Qualified"){

                                  this.consoleDebug("normal",'OptimizelySFDC - Info- Search Account via Contact- No Account found for qualified Lead. Creating a new one!');                              
                                  this.renderNewLead();
                            }
                            //Look for Lead
                            this.search3CheckLead();
                       }

                 
                 //End Data Done check
                 }
                 

                 else {
                       //Last check, we didn't get an error message that we expected or Done Object. Stop Execution and display error to user

                        this.consoleDebug("normal",'OptimizelySFDC - Error - Contact check stopped because we recieved an error or object from SFDC that we did not expect (Done not received)!');                                       

                          //Render the 1st screen again and show the message
                          this.renderMessage("error", "Contact search stopped because of an unexpected error!");
                  
                 }

                  //End Analysis of Contact SFDC Object Returned

           })
           .fail(function(data){
               //Function to handle a failed request to SFDC
               //Check to see if reason data was not returned is because of an invalid session

               this.consoleDebug("object","OptySFDC - CheckContactFailed Object:",data);
                      if (data.statusText.trim()==="Unauthorized"){
                       
                           //Debug Mode - Log to Console 
                           this.consoleDebug("normal",'OptimizelySFDC - Info - Initial attempt to get SFDC object failed because of invalid session at Contact Check. Going to get a new one!');

                           //Go get a new Token since it's expired  
                           this.forceToken=true;
                           this.goToFunction="search2";
                           this.getToken();
                      } 
                      //We received an error message outside of Invalid Session
                      else {
                           //Debug Mode - Log to Console 
                           this.consoleDebug("normal",'OptimizelySFDC - Error - Contact check stopped because we recieved an error or object from SFDC that we did not expect (Done receieved)!');
                          
                          //Render the 1st screen again and show the message
                          this.renderMessage("error", "Contact search stopped because of an unexpected error!");
                        
                      }

           });

              //End Search Contact Function
       },


       search3CheckLead: function(){

        //Function that checks to see if a lead exists, if so, find the owner and post to Chatter about that 
        //If so, then it gets the AE, SDR information
        //If not, proceed to serach2CreateLead
     
        //Debug Mode & Debug Object Mode - Log to Console
        this.consoleDebug("normal",'OptimizelySFDC - Info - We did not find an account or contact with an account so we are searching for a lead!');                                       

       //SFDC API URL to Get Lead information based on email of the requestoer
        var URLBase = this.APIBase +"query/?q=";
        var action = "Select+Id,OwnerId,SDR_Owner__r.FirstName,SDR_Owner__r.LastName,SDR_Owner__c,Status,Name,IsConverted+from+Lead+where+email ='"+this.TktEmail+"'";

        //Debug Mode & Debug Object Mode - Log to Console
        this.consoleDebug("object",'Optimizely SFDC - API Call - ',URLBase+action);

        //If we already determined it was a qualified lead, then create a new one
        if (this.QualifiedLead==="Qualified") {this.renderNewLead(); return;}                                     

        //Make the request to get the SFDC Object - Lead 
        this.ajax('fetchSFDCObject',URLBase+action)
           .done(function(data){
                 //Debug Mode & Debug Object Mode - Log to Console
                  this.consoleDebug("object",'Fetch SFDC Fetch Lead Data Object: ',data);                                       

               //Check to see if Data is Done and that TotalSize of Object is not 0
               if ((data.done) && (data.totalSize !==0)) {

                        ///Lead Successfully found.  Store info and resent Confirmation Screen
                        this.ChatterRecordId=data.records[0].Id;
                        this.ChatterOwnerId=data.records[0].SDR_Owner__c;
                        this.ChatterOwnerName = data.records[0].SDR_Owner__r.FirstName +" "+data.records[0].SDR_Owner__c.LastName;
                        this.LeadName=data.records[0].Name ;
                        this.LeadStatus= data.records[0].Status;
                        this.LeadConvertedStatus=data.records[0].IsConverted;

                        //Debug Mode - Log to Console
                        this.consoleDebug("normal",'OptimizelySFDC - Info - Lead found, showing confirmation screen!');                                       
                  
                       
                        //Debug Mode & Debug Object Mode - Log to Console
                        this.consoleDebug("normal",'OptimizelySFDC - Data - Lead Objects Data Elements - '+this.ChatterRecordId+' '+ this.ChatterOwnerId);                                       

                  
                       if(this.LeadStatus==="Sales Qualified Lead"){
  

                          //Debug Mode - Log to Console
                        this.consoleDebug("normal","OptimizelySFDC - Info - Lead found but it's already qualified. Going to search for the account via contact.");                                                    
                       
                          this.QualifiedLead="Qualified";
                          this.search2CheckContact();

                       }
                       else if (this.LeadConvertedStatus) {
                            this.consoleDebug("normal","OptimizelySFDC - Info - Lead found but is already converted. Going to search for the account via contact.");                                                    
                             this.QualifiedLead="Converted";
                             this.search2CheckContact();

                       }

                       else {
                          //Render the Confirmation screen to present data back to the user
                          this.RecordType="Lead";
                          this.renderConfirmation1("Step 1 - Lead Chatter Notification Options");
                       }

               }

               else {
               
                        //Debug Mode - Log to Console
                        this.consoleDebug("normal",'OptimizelySFDC - Info - We did not find the lead so we are going to create one!');                                       

                         //Create New Lead since we didn't find an existing one 
                         this.renderNewLead();

               }


           });



       },

       SFDCCreateLead: function(){  
        //Function to create Lead after user confirms the lead information

       //Set Lead Information based on what the user inputted on the screen
       this.LeadFN = this.$('input[name="leadfn"]').val();
       this.LeadLN = this.$('input[name="leadln"]').val();
       this.LeadCompany = this.$('input[name="leadcompany"]').val();





        //Look at debug setting to see if we should make the call to Chatter or to the console. 
        if(this.debugChatter){

                //Debug Code, and send message back to user
                this.consoleDebug("normal",'OptimizelySFDC - Success - Lead would have been created in normal non-debug mode - '+ this.LeadFN +' ' +this.LeadLN +" with a company of "+ this.LeadCompany);            
                this.renderMessage("Warning", "In Chatter debug mode, lead would've been created in normal mode.");
                //this.renderLeadDone();
     
        }
        else {

            //Proceed with creating Lead since we are not in debug mode
            //Debug Mode - Log to Console 
            this.consoleDebug("normal", "Opty SFDC - Info - Starting Lead Creation Call");
      
           //Make call SFDC to create the Lead
            this.ajax('createLead')
              .done(function(data){          
                 //Debug Mode & Debug Object Mode - Log to Console
                 this.consoleDebug("object","Create SFDC Lead Data Object:", data);

                  //Confirm if the lead was created successfully
                  if (data.success && data.errors.length===0)  {

                            //Debug Mode - Log to Console
                            this.consoleDebug("normal", 'OptimizelySFDC - Success - Lead Created! '+ this.LeadFN +' ' +this.LeadLN +' + was created as a new lead in SFDC with a company of '+this.LeadCompany);
      

                           this.newLeadId= data.id;


                            //Add information to the ticket
                            var ticket = this.ticket();
                            var currentDate = new Date();
                            ticket.tags().add("leadcreated");
                            var commentText = "Opty App - Internal Tracking - New Lead Created. Record Link = " +this.SFDCinstance+"/"  + this.newLeadId + " LeadName = " + this.LeadFN + " " + this.LeadLN +". Posted by "+this.currentUser().name() + " at " + currentDate;
                            
                            var dataObject = {"ticket":{"comment":{"public":false, "body": commentText}}};
                            var UserAPIURL = "/api/v2/tickets/"+this.ticket().id()+".json";

                           this.ajax('updateZendeskData',UserAPIURL,dataObject)
                               .done(function(data){
                                    //If in debug mode, write to console
                                    this.consoleDebug("object",'ZD Ticket Update (Comment Update - New Lead):',data);

                                   //After successful update, update APP screen
                                   services.notify("Ticket Updated By Opty App - Internal Note for Lead Creation");
                               })
                               .fail(function(data){
                                   this.consoleDebug("object",'Error Updating Ticket for Sent Via:',data);
                                   services.notify("Error! Update to add ticket comment failed.");

                              });



                            
                            this.renderLeadDone();

                  }
                  
                  else{             
                      //Data returned points to error in creating lead. Log to console and present error to user 

                       //Debug Mode - Log to Console
                       this.consoleDebug("normal", "OptySFDC - Error - Error creating Lead!");
                       this.renderMessage("Error","Lead not created due to error in leading creation process.");
                  }

                  });
        }


       },

       ChatterConfirmation: function() {
       
       //Function used by the system to post to Chatter. This is called when the Agent confirms the Chatter Message

       
       //Get the Chatter Message from the box in case it was changed
       var RecordName = "";
       this.ChatterMessage = this.$('textarea[name="chattermessage"]').val();

       //Set the RecordName based on the type of Record (Account Name or Lead Name)
       if (this.RecordType==="Lead"){
         RecordName=this.LeadName;
       }
       else {
        RecordName=this.OrgName;
       } 
 
        //Logic to post to Console during debug mode, or to post to Chatter
        //part 1 - Write to Console if setting is set
        if(this.debugChatter){

              this.consoleDebug("normal","OptimizelySFDC - Chatter Post - Post to "+ this.RecordType + " Call not made to SFDC. Name = "+ RecordName+"Record = "+this.ChatterRecordId +" where Owner = "+ this.ChatterOwnerName);
              this.consoleDebug("normal",'OptimizelySFDC - Info - Chatter Message  for '+ this.ChatterOwnerName +': ' + this.ChatterMessage);

              //Render the 1st screen again and show the message
              this.renderMessage("Warning","In Chatter debug mode, Chatter message not posted. It would've been posted in non-debug mode!");
   
         }

         //Part 2 - Post to Chatter and call the Ajax request to start taht
         else {

                 //Debug Mode & Debug Object Mode - Log to Console
                 this.consoleDebug("normal","OptimizelySFDC - Chatter Post - Post Request to "+ this.RecordType + " Name = "+ RecordName+"Record = "+this.ChatterRecordId +" where Owner = "+ this.ChatterOwnerName);                                                    
                 this.consoleDebug("normal",'OptimizelySFDC - Info - Chatter Message  for '+ this.ChatterOwnerName +': ' + this.ChatterMessage);                                                    
             if (this.ChatterOwnerName=="Not Assigned. SDR Lead only will be notified"){
                  this.ajax('postChatter_single')
                    .done (function(data){
                        this.chatter_success(data,RecordName);
                      })
                    .fail(function(data){
                      this.chatter_failed(data,RecordName);
                      }); 

             }
             else {
                  this.ajax('postChatter')
                    .done (function(data){
                        this.chatter_success(data,RecordName);
                      })
                    .fail(function(data){
                      this.chatter_failed(data,RecordName);
                      }); 

                 }          
          }

       },


       chatter_success:function(data,RecordName){

          //Look at the Chatter response to confirm it was success

                  //Debug Mode & Debug Object Mode - Log to Console
                  this.consoleDebug("object",'Post Chatter SDFC Object: ',data);                                                    

                 //Check to make sure an id is returned to confirm successful Chatter post 
                 if (typeof data.id !=='undefined' && data.id !== null) {
                    
                  //Debug Mode - Log to Console
                   this.consoleDebug("normal",'OptimizelySFDC - Success - Successfully posted on Chatter feed of '+ this.RecordType + 'Record was for ' +RecordName);                                                    
                   this.consoleDebug("normal",'OptimizelySFDC - Info - Chatter Message  for '+ this.ChatterOwnerName +': ' + this.ChatterMessage);                                                    

                                          
                          //Add information to the ticket
                          var ticket = this.ticket();
                          var currentDate = new Date();
                          ticket.tags().add("salesnotified");
                          var commentText = "Opty App - Internal Tracking Note - Sales Notified via Chatter. Record Link - " +this.SFDCinstance + "/"+this.ChatterRecordId + " Message - "+ this.ChatterMessage +". Posted by "+this.currentUser().name()+ " at " + currentDate;
                          var dataObject = {"ticket":{"comment":{"public":false, "body": commentText}}};
                            var UserAPIURL = "/api/v2/tickets/"+this.ticket().id()+".json";

                           this.ajax('updateZendeskData',UserAPIURL,dataObject)
                               .done(function(data){
                                    //If in debug mode, write to console
                                    this.consoleDebug("object",'ZD Ticket Update (Comment Update - New Lead):',data);

                                   //After successful update, update APP screen
                                   services.notify("Ticket Updated By Opty App - Internal Note for Lead Creation");
                               })
                               .fail(function(data){
                                   this.consoleDebug("object",'Error Updating Ticket for Sent Via:',data);
                                   services.notify("Error! Update to add ticket comment failed.");

                              });


                          //Render the 1st screen again and show the message
                          this.renderMessage("Success","Chatter Message Successfully posted!");
                  }

                  else {


                  //Debug Mode - Log to Console
                   this.consoleDebug("normal",'OptimizelySFDC - Error - Error in posting on Chatter feed of '+ this.RecordType + 'Record was for ' +RecordName);                                                    

                  //Render the 1st screen again and show the message
                  this.renderMessage("Error","Chatter Message not posted due to error");

                }

       },

       chatter_failed:function(data,RecordName){

         //Debug Mode - Log to Console
                   this.consoleDebug("normal",'OptimizelySFDC - Error - Error in posting on Chatter feed of '+ this.RecordType + 'Record was for ' +RecordName);                                                    

                  //Render the 1st screen again and show the message
                  this.renderMessage("Error","Chatter Message not posted due to error");


       },
        switchLeadCountry: function(){
        //function to switch the SDR Country from EU to US or US to EU. This changes the lead and updates the drop down

       
        if(this.$('#switchlead').text()==="Switch to EU Lead"){
            this.SDRLeadId= this.EULeadId;
            this.SDRLeadName =this.EULeadName;

            this.$('#switchlead').text("Switch to US Lead");
        }
        else {
            this.SDRLeadId= this.USLeadId;
            this.SDRLeadName =this.USLeadName;
            this.$('#switchlead').text("Switch to EU Lead");
        }
        

        this.$('#SDRLead').text(this.SDRLeadName);


       },

       cancelChange:function(){

             var editContainer= "";
           if (this.$('#switchlead').text()==="Switch to EU Lead"){
              editContainer="#usSDR"; 
           }
           else {
              editContainer="#euSDR";
           }  

            this.$(editContainer).addClass('hide'); this.$(editContainer).removeClass("show");
            this.$(editContainer).css({"display":"none"});
            this.$('#switchlead').removeClass("hide");this.$('#switchlead').addClass("show");
            this.$('#cancelSDR').removeClass("show");this.$('#cancelSDR').addClass("hide");
            this.$('#changeSDR').text("Change Record Owner");


       },

       changeSDR:function(){

           var editContainer= "";
           if (this.$('#switchlead').text()==="Switch to EU Lead"){
              editContainer="#usSDR"; 
           }
           else {
              editContainer="#euSDR";
           }  

          if (this.$('#changeSDR').text()==="Change Record Owner"){
              this.$(editContainer).removeClass("hide"); this.$(editContainer).addClass("show");
              this.$(editContainer).css({"display":"inline"});
              this.$('#switchlead').removeClass("show");this.$('#switchlead').addClass("hide");
              this.$('#cancelSDR').removeClass("hide");this.$('#cancelSDR').addClass("show");

             this.$('#changeSDR').text("Save Record Owner To:");

          }
          else {
            this.$(editContainer).addClass('hide'); this.$(editContainer).removeClass("show");
            this.$(editContainer).css({"display":"none"});
            this.ChatterOwnerId= this.$(editContainer+" option:selected").val();
            this.ChatterOwnerName =this.$(editContainer+' option:selected').text();
            this.$('#RecordOwner').text(this.ChatterOwnerName);
            this.$('#switchlead').addClass('show');
            this.$('#switchlead').removeClass("hide");this.$('#switchlead').addClass("show");
            this.$('#cancelSDR').removeClass("show");this.$('#cancelSDR').addClass("hide");
            this.$('#changeSDR').text("Change Record Owner");

          }

       },

       LeadWait: function(){
        //Wait for 4 minutes before searching for the Lead and rendering the Chatter Confirmation screen for the lead

         //Show loading screen
        this.$(this.sfdcmodal).removeClass("show"); this.$(this.sfdcmodal).addClass("hide");
        this.$("#loading").addClass("show"); this.$("#loading").removeClass("hide");
        this.$("#loadingheader").text("Waiting five minutes for lead data enrichment process to end. The Chatter confirmation screen will show once complete.");
        this.sfdcmodal="#loading";

         var self=this;
         this.timeoutId = setTimeout(function() {
          self.search3CheckLead();
        }, 240000);

          
       },


        renderConfirmation1: function(ccheader){
         //Function to render the confirmation chatter notification in the modal

        var RecordNameValue="";
        if (this.RecordType==="Lead") {
          RecordNameValue=this.LeadName;
        }
        else {
          RecordNameValue= this.OrgName;
        } 

        this.ChatterMessage =  "A Sales related email came through via Zendesk. Please look at the ticket titled \""+this.TktSubject+"\" from "+this.TktName+" for detailed information. The information is available in the Zendesk Object on the " +this.RecordType+" screen. ";
        if (this.ChatterOwnerName=='null null'){
          this.ChatterOwnerName="Not Assigned. SDR Lead only will be notified";
        }

        //Update section of confirmation page with update value
        this.$('.RecordType').text(this.RecordType);
        this.$('#ccheader').text(ccheader);
        this.$('#RecordId').text(this.ChatterRecordId);
        this.$('#RecordName').text(RecordNameValue);
        this.$('#RecordOwner').text(this.ChatterOwnerName);
        this.$('#SDRLead').text(this.SDRLeadName);
        this.$("textarea[name='chattermessage']").text(this.ChatterMessage);

        //Show the correct buttons
        this.modalButtonReset(); 
        this.$('#postchatter').removeClass('hidden'); this.$('#postchatter').addClass('shown');
        this.$('#switchlead').removeClass('hidden'); this.$('#switchLead').addClass('shown');
        this.$('#leadcontinue').removeClass('shown'); this.$('#leadcontinue').addClass('hidden');


         //Hide load and show confirmation screen
         this.$("#loading").addClass("hide"); this.$("#loading").removeClass("show"); 
         this.$("#confirmation").addClass("show"); this.$("#confirmation").removeClass("hide"); 
         this.sfdcmodal="#confirmation";



        },

        renderMessage: function(type,message){
        //Function to render message on the SFDC Modal

        //Hide current screen in modal and show message
        this.modalButtonReset();
        this.$(this.sfdcmodal).removeClass("show"); this.$(this.sfdcmodal).addClass("hide");
        this.$("#showmessage").addClass("show"); this.$("#showmessage").removeClass("hide");
        this.$('#closetext').text('Close');  
        var spanClass='';
        if (type==="Error") { spanClass="Red";}
        else if (type==="Warning") {spanClass="Orange";}
        else {spanClass="Green";}

        this.$('#showmessage').html("<span class='"+ spanClass + "'><b>"+type+"</b></span>: "+message);
        this.sfdcmodal="#showmessage";
 
       },

       renderNewLead: function(){
        //Function to render New Lead on SFDC Modal

        
        //Show the correct buttons
        this.modalButtonReset();
        this.$('#createlead').removeClass('hidden'); this.$('#createlead').addClass('shown');


        this.$('#leadheader').text("Create Lead - No existing record found");
        this.$("input[name='leadln']").val(this.TktName.split(' ')[1]);
        this.$("input[name='leadfn']").val(this.TktName.split(' ')[0]);
        this.$("input[name='leadcompany']").val(this.TktEmail.split('@')[1]);
        this.$('#leadstatus').text(this.LeadStatus);
        this.$('#leadsource').text(this.LeadSource);

        //Hide current screen and show message
        this.$("#loading").addClass("hide"); this.$("#loading").removeClass("show"); 
        this.$("#newlead").addClass("show"); this.$("#newlead").removeClass("hide"); 
        this.sfdcmodal="#newlead";


       },

      renderLeadDone: function(){
      //Function to render lead creation confirmation. After a lead is created, it can take 5 minutes for the data enrichment is complete.
      //Give the users the ability to close the screen and wait manually, show a timer when done, or manually check to see if data enrichment is done

        //Show the correct buttons
        this.modalButtonReset(); 
        this.$('#createlead').removeClass('shown'); this.$('#createlead').addClass('hidden');
        this.$('#leadcontinue').removeClass('hidden'); this.$('#leadcontinue').addClass('show');
        this.$('#closetext').text('Close');

        var leadLink = this.SFDCinstance +"/"+this.newLeadId;
        this.$('#leadlink').text(leadLink);
        this.$('#leadlink').attr("href",leadLink);


        //Hide current screen and show message
        this.$(this.sfdcmodal).removeClass("show"); this.$(this.sfdcmodal).addClass("hide");
        this.$("#leadconf").addClass("show"); this.$("#leadconf").removeClass("hide"); 
        this.sfdcmodal="#leadconf";




      },

      modalButtonReset: function(){

       //Function to reset the SFDC modal buttons and screens
       this.$('#createlead').removeClass("shown");this.$('#createlead').addClass("hidden");
       this.$('#leadcontinue').removeClass("shown");this.$('#leadcontinue').addClass("hidden");
       this.$('#postchatter').removeClass("shown");this.$('#postchatter').addClass("hidden");
       this.$('#switchlead').removeClass("shown");this.$('#switchlead').addClass("hidden");
       this.$('#closetext').text('Cancel');

       

       if (this.store('countrysetting')){
         this.$('#switchlead').text("Switch to US Lead");
         this.SDRLeadId= this.EULeadId;
         this.SDRLeadName =this.EULeadName;
         this.$('#SDRLead').text(this.SDRLeadName);
      }
      else {
        this.SDRLeadId= this.USLeadId;
            this.SDRLeadName =this.USLeadName;
            this.$('#switchlead').text("Switch to EU Lead");
            this.$('#SDRLead').text(this.SDRLeadName);
      }

  

      },

      modalCountry: function(){
        //Function to set Chatter Screen based on the users Country Setting
        
       if (this.store('countrysetting')===false){
           this.$('#switchlead').text("Switch to EU Lead");
           this.SDRLeadId= this.USLeadId;
           this.SDRLeadName=this.USLeadName;
       }

       else {
           this.$('#switchlead').text("Switch to US Lead");
           this.SDRLeadId= this.EULeadId;
           this.SDRLeadName=this.EULeadName;
       }
       
        this.$('#changeSDR').text("Change Record Owner");
        this.$('#usSDR').css({"display":"none"}); this.$('#usSDR').addClass('hide');
        this.$('#euSDR').css({"display":"none"}); this.$('#euSDR').addClass('hide');

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
