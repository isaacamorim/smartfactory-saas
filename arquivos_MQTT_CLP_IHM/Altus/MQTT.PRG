(*Configurações de conexão do broker*)
MQTT_Fb.CONNECTION_CONFIG.sHostname := '191.252.217.250';  //Ip do seu broker
MQTT_Fb.CONNECTION_CONFIG.uiPort := 1883; 										//porta padrão do MQTT
MQTT_Fb.CONNECTION_CONFIG.sClientId := '';					//fornecça um ID unico na rede MQTT
MQTT_Fb.CONNECTION_CONFIG.bCleanSession := TRUE;								//Sugerido manter essa opção em true ca


MQTT_FB.CONNECTION_CONFIG.sUser := 'clp_eva1000'; 
MQTT_FB.CONNECTION_CONFIG.sPass := '123456'; 


(*Ponteiros para as variáveis de publicação e assinaturas*)
MQTT_FB.PUBLISH := Pubs;																					
MQTT_FB.SUBSCRIBE := Subs;

(*Habilita a função MQTT*)
MQTT_FB.ENABLE := MQTT_Fb_Enable;

(*Variáveis de erro da função MQTT*)
MQTT_Fb_Error := MQTT_FB.ERROR;
MQTT_Fb_State := MQTT_FB.STATE;
MQTT_Fb_Error_Code := MQTT_FB.ERROR_CODE;


(*Variáveis de status e Mensagens recebidas da função MQTT*)
MQTT_FB_Pub_Status := MQTT_FB.PUBLISH_STATUS;
MQTT_FB_Received_Messages := MQTT_FB.RECEIVED_MESSAGES;

(*Publicação de variáveis*)
FOR i:= 1 TO TO_INT(gc_uiMaxPubs) DO

    Pubs[i].sPublishTopic := PUBLISH_TOPICS[i];

    Pubs[i].pbPublishPayload := ADR(PUBS_PAYLOADS[i]);

    Pubs[i].uiPublishPayloadSize := TO_UINT(LEN(PUBS_PAYLOADS[i]));

    Pubs[i].ePublishMessageQoS := MQTT_QOS_0;

    Pubs[i].bPublishRetain := FALSE;


    IF (PUBS_PAYLOADS[i] <> PUBS_PAYLOADS_OLD[i]) THEN

        PUBS_PAYLOADS_OLD[i] := PUBS_PAYLOADS[i];

        Pubs[i].bEnablePublish := TRUE;

    END_IF


    IF (MQTT_FB_Pub_Status[i]) THEN

        Pubs[i].bEnablePublish := FALSE;

    END_IF

END_FOR


//==================================================
// HEARTBEAT
//==================================================
// Publica status da maquina ligada
IF PULSE_5S THEN

    Pubs[13].bEnablePublish := TRUE;

END_IF;

(*Assinatura de variáveis*)
FOR i:= 1 TO TO_INT(gc_uiMaxSubs) DO
	Subs[i].sSubscribeTopic := SUBSCRIBE_TOPICS[i];
	Subs[i].pbPayloadBuffer := ADR(SUBS_PAYLOADS[i]);
	Subs[i].uiMaxPayloadSize := SIZEOF(SUBS_PAYLOADS[i]);
	Subs[i].eSubscribeQoS := MQTT_QOS_0;
END_FOR

(*RECONEXÃO COM O BROKER EM CASO DE FALHA*)
IF MQTT_FB_Error THEN
	MQTT_FB_Enable := PULSE_5S;
ELSE
	MQTT_FB_Enable := TRUE;
END_IF

(*CHAMADA DA FUNÇÃO MQTT*)
MQTT_FB();