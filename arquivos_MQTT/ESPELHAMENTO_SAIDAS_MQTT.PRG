(*ESPELHAMENTO DE SAÍDAS DIGITAIS*)
Ciclo_Manual         := TO_BOOL(SUBS_PAYLOADS[1]);
Ciclo_Automatico     := TO_BOOL(SUBS_PAYLOADS[2]);
//NH                           := TO_BOOL(SUBS_PAYLOADS[3]);
(*
Pr_Perc_Solda_Horizontal     := TO_REAL(SUBS_PAYLOADS[4]);  // Temperatura Horizontal %
Pr_Perc_Solda_Vertical       := TO_REAL(SUBS_PAYLOADS[5]);  // Temperatura Vertical %
SEL_MAQ_MESA_FIXA_MOVEL      := TO_BOOL(SUBS_PAYLOADS[6]);  // 0=EMA, 1=EVA
SEL_MAQ_SOMENTE_BALANCA      := TO_BOOL(SUBS_PAYLOADS[7]);  // Somente Balança
Ef_Freq_Mot_Tracionador      := TO_REAL(SUBS_PAYLOADS[8]);  // Frequência motor
SEL_BALANCA_ATIVA            := TO_BOOL(SUBS_PAYLOADS[9]);  // Balança ativa
Sel_Fim_Produto              := TO_BOOL(SUBS_PAYLOADS[10]); // Fim do Produto
Sel_Fim_Fita_Datador         := TO_BOOL(SUBS_PAYLOADS[11]); // Fim Fita Datador
Sel_Fim_Embalagem            := TO_BOOL(SUBS_PAYLOADS[12]); // Fim Embalagem
Sel_Emerg_Enfardadeira       := TO_BOOL(SUBS_PAYLOADS[13]); // Emergência Enfardadeira
SEL_INV_RS485_OU_ANALOG      := TO_BOOL(SUBS_PAYLOADS[14]); // Inversor ATV320
Sel_Datador                  := TO_BOOL(SUBS_PAYLOADS[15]); // Datador ON/OFF
SEL_TEMP_DATADOR_CLP         := TO_BOOL(SUBS_PAYLOADS[16]); // Temp Datador via CLP
Pr_Tipo_Dosador              := TO_INT(SUBS_PAYLOADS[17]);  // Tipo Dosador (0-3)
SEL_PARA_VAZIO               := TO_BOOL(SUBS_PAYLOADS[18]); // Parada Pacote Vazio
Sel_Reserva_Q12              := TO_BOOL(SUBS_PAYLOADS[19]); // Reserva Q12
Sel_Reserva_Q13              := TO_BOOL(SUBS_PAYLOADS[20]); // Reserva Q13
*)


// Posições 21-30 livres para ângulos quando Fábio da Altus retornar
(*
AO3 := TO_INT(SUBS_PAYLOADS[21]);
AO3 := TO_INT(SUBS_PAYLOADS[22]);
AO3 := TO_INT(SUBS_PAYLOADS[23]);
AO3 := TO_INT(SUBS_PAYLOADS[24]);
AO3 := TO_INT(SUBS_PAYLOADS[25]);
AO3 := TO_INT(SUBS_PAYLOADS[26]);
AO3 := TO_INT(SUBS_PAYLOADS[27]);
AO3 := TO_INT(SUBS_PAYLOADS[28]);
AO3 := TO_INT(SUBS_PAYLOADS[29]);
AO3 := TO_INT(SUBS_PAYLOADS[30]);
*)


(*
PARA ADICIONAR MAIS VARIÁVEIS PARA RECEBER O VALOR DAS ASSINATURAS, BASTA QUE O USUÁRIO ADICIONE AS SUAS VARIÁVEIS EM POSIÇÕES *DISPONÍVEIS* DE "SUBS_PAYLOADS" , POR EXEMPLO:

VARIAVEL_ASSINATURA_NOVA_1 := TO_INT(SUBS_PAYLOADS[21]); <--------------- NESTE EXEMPLO A VARIÁVEL "VARIAVEL_ASSINATURA_NOVA_1" É DO TIPO INT
VARIAVEL_ASSINATURA_NOVA_2 := TO_REAL(SUBS_PAYLOADS[22]);<--------------- NESTE EXEMPLO A VARIÁVEL "VARIAVEL_ASSINATURA_NOVA_2" É DO TIPO REAL
VARIAVEL_ASSINATURA_NOVA_3 := TO_BOOL(SUBS_PAYLOADS[22]);<--------------- NESTE EXEMPLO A VARIÁVEL "VARIAVEL_ASSINATURA_NOVA_3" É DO TIPO BOOL


*)