(*ESPELHAMENTO DE ENTRADAS DIGITAIS*)

//==================================================
// [1] STATUS_1
// nh, ciclo, vel, total
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"ciclo":');

IF M_Em_Ciclo THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, ',"vel":');
temp := CONCAT(temp, TO_STRING(EF_RPM_Mesa));

temp := CONCAT(temp, ',"total":');
temp := CONCAT(temp, TO_STRING(Ef_Tot_Produzido));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[1] := temp;



//==================================================
// [2] STATUS_2
// nh, pac_min, turno, manual, auto
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"pac_min":');
temp := CONCAT(temp, TO_STRING(EF_Pacotes_Min));

temp := CONCAT(temp, ',"turno":');
temp := CONCAT(temp, TO_STRING(EF_Turno));

temp := CONCAT(temp, ',"manual":');

IF Ciclo_Manual THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, ',"auto":');

IF Ciclo_Automatico THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[2] := temp;



//==================================================
// [2] TURNO
// Estimativa: ~70 chars
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"t1":');
temp := CONCAT(temp, TO_STRING(Prod_Turno_1));

temp := CONCAT(temp, ',"t2":');
temp := CONCAT(temp, TO_STRING(Prod_Turno_2));

temp := CONCAT(temp, ',"t3":');
temp := CONCAT(temp, TO_STRING(Prod_Turno_3));

temp := CONCAT(temp, ',"lote":');
temp := CONCAT(temp, TO_STRING(EF_Lote_Producao));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[3] := temp;


//==================================================
// [3] PESOS_1
// nh, min, max
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"min":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Menor));

temp := CONCAT(temp, ',"max":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Maior));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[4] := temp;

//==================================================
// [4] PESOS_2
// nh, media, bruto_scaime, liq_scaime
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"media":');

IF EF_Peso_Media = EF_Peso_Media THEN
    temp := CONCAT(temp, TO_STRING(EF_Peso_Media));
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, ',"bruto_scaime":');
temp := CONCAT(temp, TO_STRING(Peso_Bruto_Scaime));

temp := CONCAT(temp, ',"liq_scaime":');
temp := CONCAT(temp, TO_STRING(Peso_Liquido_Scaime));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[5] := temp;


//==================================================
// [5] PESOS_3
// nh, estavel, bruto, liq, tara, tara_cfg, ok
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"estavel":');

IF Peso_Estavel THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, ',"bruto":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Bruto));

temp := CONCAT(temp, ',"liq":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Liquido));

temp := CONCAT(temp, ',"tara":');
temp := CONCAT(temp, TO_STRING(EF_Tara));

temp := CONCAT(temp, ',"tara_cfg":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Tara));

temp := CONCAT(temp, ',"ok":');

IF M_Peso_OK THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[6] := temp;

//==================================================
// [5] SEMANA_1
// nh, seg, ter, qua, qui
// Estimativa: ~180 chars
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"seg":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Seg));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Seg));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Seg));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, ',"ter":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Ter));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Ter));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Ter));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, ',"qua":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Qua));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Qua));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Qua));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, ',"qui":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Qui));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Qui));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Qui));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[7] := temp;


//==================================================
// [6] SEMANA_2
// nh, sex, sab, dom
// Estimativa: ~140 chars
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"sex":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Sex));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Sex));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Sex));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, ',"sab":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Sab));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Sab));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Sab));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, ',"dom":[');
temp := CONCAT(temp, TO_STRING(Producao_Turno_1_Dom));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_2_Dom));
temp := CONCAT(temp, ',');
temp := CONCAT(temp, TO_STRING(Producao_Turno_3_Dom));
temp := CONCAT(temp, ']');

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[8] := temp;


//==================================================
// [7] CONFIG_1
// nh, peso_ref, tol_min
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"peso_ref":');
temp := CONCAT(temp, TO_STRING(PR_Peso_Desejado));

temp := CONCAT(temp, ',"tol_min":');
temp := CONCAT(temp, TO_STRING(PR_Tolerancia_Min));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[9] := temp;


//==================================================
// [8] CONFIG_2
// nh, tol_max, t_estab, peso_padrao
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"tol_max":');
temp := CONCAT(temp, TO_STRING(PR_Tolerancia_Max));

temp := CONCAT(temp, ',"t_estab":');
temp := CONCAT(temp, TO_STRING(PR_T_Estabilizacao));

temp := CONCAT(temp, ',"peso_padrao":');

IF Insira_Peso_Padrao THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[10] := temp;

//==================================================
// [8] KPI_1
// nh, ult_peso, ok, nok, peso_ok, peso_nok
// Estimativa: ~160 chars
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"ult_peso":');
temp := CONCAT(temp, TO_STRING(EF_Ultimo_Peso));

temp := CONCAT(temp, ',"ok":');
temp := CONCAT(temp, TO_STRING(EF_Pacotes_OK));

temp := CONCAT(temp, ',"nok":');
temp := CONCAT(temp, TO_STRING(EF_Pacotes_NOK));

temp := CONCAT(temp, ',"peso_ok":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Pacote_OK));

temp := CONCAT(temp, ',"peso_nok":');
temp := CONCAT(temp, TO_STRING(EF_Peso_Pacote_NOK));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[11] := temp;


//==================================================
// [9] KPI_2
// nh, peso_ok_total, peso_nok_total, prod_turno
// Estimativa: ~130 chars
//==================================================

temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"peso_ok_total":');
temp := CONCAT(temp, TO_STRING(EF_Peso_OK_c_Pacote));

temp := CONCAT(temp, ',"peso_nok_total":');
temp := CONCAT(temp, TO_STRING(EF_Peso_NOK_c_pacote));

temp := CONCAT(temp, ',"prod_turno":');
temp := CONCAT(temp, TO_STRING(Ef_Tot_Produzido_Turno));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[12] := temp;


//==================================================
// [13] heartbeat
// 
//==================================================
temp := '';
temp := CONCAT(temp, '{');

temp := CONCAT(temp, '"nh":"');
temp := CONCAT(temp, NH);
temp := CONCAT(temp, '"');

temp := CONCAT(temp, ',"alive":1');

temp := CONCAT(temp, ',"hb":');
temp := CONCAT(temp, TO_STRING(EF_Tot_Produzido));

temp := CONCAT(temp, '}');

PUBS_PAYLOADS[13] := temp;


(*
//MODOS (opcional separado)
temp := '';
temp := CONCAT('{', '"manual":');

IF Ciclo_Manual THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, ',"auto":');

IF Ciclo_Automatico THEN
    temp := CONCAT(temp, '1');
ELSE
    temp := CONCAT(temp, '0');
END_IF;

temp := CONCAT(temp, '}');

//
PUBS_PAYLOADS[14] := temp;
*)








(*

PARA ADICIONAR MAIS VARIÁVEIS PARA PUBLICAÇÃO, BASTA QUE O USUÁRIO ADICIONE AS SUAS VARIÁVEIS EM POSIÇÕES *DISPONÍVEIS* DE "PUBS_PAYLOADS" , POR EXEMPLO:

PUBS_PAYLOADS[68] := TO_STRING(NH);
PUBS_PAYLOADS[69] := TO_STRING(NH);
*)