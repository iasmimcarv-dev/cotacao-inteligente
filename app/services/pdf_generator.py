from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime


def gerar_pdf_cotacao(dados_cotacao: dict, idades: list[int]) -> BytesIO:
    """
    Gera um PDF profissional com layout moderno e responsivo
    """
    buffer = BytesIO()
    # Margens ajustadas para layout proporcional
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20, bottomMargin=20, leftMargin=20, rightMargin=20)
    elements = []
    
    # ===== PALETA DE CORES =====
    blue_primary = colors.HexColor('#0052cc')
    blue_dark = colors.HexColor('#003a9e')
    blue_light = colors.HexColor('#f0f4ff')
    green_success = colors.HexColor('#10b981')
    yellow_warning = colors.HexColor('#f59e0b')
    red_alert = colors.HexColor('#ef4444')
    slate900 = colors.HexColor('#1a202c')
    slate700 = colors.HexColor('#4a5568')
    slate500 = colors.HexColor('#6b7280')
    slate300 = colors.HexColor('#d1d5db')
    slate100 = colors.HexColor('#f8f9fa')
    white = colors.HexColor('#ffffff')
    
    # ===== ESTILOS =====
    styles = getSampleStyleSheet()
    
    header_title = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=blue_dark,  # usar azul escuro para aparecer em fundo claro
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    header_subtitle = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=white,
        spaceAfter=5,
        fontName='Helvetica'
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=slate900,
        spaceAfter=12,
        spaceBefore=15,
        fontName='Helvetica-Bold',
        borderColor=slate300,
        borderPadding=8
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.textColor = slate900
    
    small_style = ParagraphStyle(
        'Small',
        parent=normal_style,
        fontSize=9,
        textColor=slate700
    )
    
    # Estilos adicionais para cards de preço
    price_label = ParagraphStyle(
        'PriceLabel',
        parent=normal_style,
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica-Bold'
    )
    
    price_value_blue = ParagraphStyle(
        'PriceValueBlue',
        parent=normal_style,
        fontSize=18,
        textColor=blue_primary,
        fontName='Helvetica-Bold'
    )
    
    price_value_green = ParagraphStyle(
        'PriceValueGreen',
        parent=normal_style,
        fontSize=18,
        textColor=green_success,
        fontName='Helvetica-Bold'
    )
    
    price_small = ParagraphStyle(
        'PriceSmall',
        parent=normal_style,
        fontSize=8,
        textColor=colors.HexColor('#999999')
    )
    
    attention_style = ParagraphStyle(
        'Attention',
        parent=normal_style,
        fontSize=10,
        textColor=colors.HexColor('#92400e')
    )
    
    
    # ===== HEADER COM FUNDO AZUL =====
    header_content = []
    
    # Título principal
    header_content.append(Paragraph("Cotação de Plano de Saúde", header_title))
    
    # Data e beneficiários
    data_geracao = datetime.now().strftime("%d de %B de %Y").replace('January', 'janeiro').replace('February', 'fevereiro').replace('March', 'março').replace('April', 'abril').replace('May', 'maio').replace('June', 'junho').replace('July', 'julho').replace('August', 'agosto').replace('September', 'setembro').replace('October', 'outubro').replace('November', 'novembro').replace('December', 'dezembro')
    header_content.append(Paragraph(f"Data: <b>{data_geracao}</b>", header_subtitle))
    
    # Info do operador (será adicionada para cada resultado)
    
    # Tabela para o header com fundo azul
    header_table = Table([
        [Spacer(1, 5)],
        [Paragraph("&nbsp;".join(p.text for p in header_content), header_subtitle)],
        [Spacer(1, 5)]
    ], colWidths=[7.5*inch])
    
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), blue_dark),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 30),
        ('RIGHTPADDING', (0, 0), (-1, -1), 30),
        ('TOPPADDING', (0, 0), (-1, -1), 25),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 25),
    ]))
    
    # Criar header simplificado (sem estilos inline)
    elements.append(Paragraph("Cotação de Plano de Saúde", header_title))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(f"📅 Data: <b>{data_geracao}</b>", small_style))
    elements.append(Spacer(1, 15))
    
    # ===== RESULTADOS =====
    desconto_pct = float(dados_cotacao.get('desconto_percentual') or 0)
    
    if not dados_cotacao.get('resultados'):
        elements.append(Paragraph("Nenhum plano encontrado com os critérios selecionados.", normal_style))
    else:
        for idx, resultado in enumerate(dados_cotacao['resultados'], 1):
            # Separador de página se não for o primeiro
            if idx > 1:
                elements.append(PageBreak())
            
            # ===== CABEÇALHO DO PLANO =====
            preco_total = float(resultado['preco_total'])
            
            # Calcular desconto total
            total_desc_num = 0.0
            if desconto_pct and desconto_pct > 0 and resultado.get('beneficiarios'):
                for ben in resultado['beneficiarios']:
                    valor_num = float(ben['valor'])
                    total_desc_num += max(0.0, valor_num - (valor_num * desconto_pct / 100.0))
            else:
                total_desc_num = preco_total
            
            valor_economizado = preco_total - total_desc_num
            
            # Cabeçalho azul escuro
            operadora = resultado.get('operadora', 'N/A')
            plano = resultado.get('plano', 'N/A')
            num_beneficiarios = len(resultado.get('beneficiarios', []))
            
            elementos_header = [
                Paragraph(f"<b>{operadora}</b> — {plano}", ParagraphStyle('', parent=styles['Normal'], fontSize=14, textColor=white, fontName='Helvetica-Bold')),
                Paragraph(f"Beneficiários: {num_beneficiarios} pessoa{'s' if num_beneficiarios > 1 else ''}", ParagraphStyle('', parent=styles['Normal'], fontSize=10, textColor=white))
            ]
            
            header_plan = Table([elementos_header], colWidths=[7.5*inch])
            header_plan.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), blue_dark),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 15),
                ('RIGHTPADDING', (0, 0), (-1, -1), 15),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ]))
            
            elements.append(header_plan)
            elements.append(Spacer(1, 15))
            
            # ===== CARDS DE PREÇO =====
            preco_fmt = f"R$ {preco_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            desconto_fmt = f"R$ {valor_economizado:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            final_fmt = f"R$ {total_desc_num:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            
            # Criar cards sem HTML inline styles
            preco_cards = [
                [
                    Paragraph("VALOR TOTAL", price_label) if Paragraph else "",
                    Paragraph("DESCONTO APLICADO", price_label) if Paragraph else "",
                    Paragraph("VALOR FINAL", price_label) if Paragraph else ""
                ],
                [
                    Paragraph(preco_fmt, price_value_blue),
                    Paragraph(f"-{desconto_pct:.0f}%", price_value_green),
                    Paragraph(final_fmt, price_value_green)
                ],
                [
                    Paragraph("sem desconto", price_small),
                    Paragraph(f"economize {desconto_fmt}", price_small),
                    Paragraph("Melhor preço", price_small)
                ]
            ]
            
            price_table = Table(preco_cards, colWidths=[2.3*inch, 2.3*inch, 2.3*inch])
            price_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.98, 0.98, 1.0)),
                ('BACKGROUND', (0, 1), (-1, 1), colors.Color(0.98, 0.98, 1.0)),
                ('BACKGROUND', (0, 2), (-1, 2), colors.Color(0.98, 0.98, 1.0)),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BORDER', (0, 0), (-1, -1), 0.5, slate300),
                ('LEFTBORDER', (0, 0), (0, -1), 4, blue_primary),
                ('LEFTBORDER', (1, 0), (1, -1), 4, blue_primary),
                ('LEFTBORDER', (2, 0), (2, -1), 4, green_success),
            ]))
            
            
            elements.append(price_table)
            elements.append(Spacer(1, 20))
            
            # ===== DESTAQUE (ATENÇÃO) =====
            elements.append(Table([
                [Paragraph("💡 <b>Atenção:</b> Preço válido para o período de cobertura conforme especificado. Consulte os prazos de carência antes de contratar.", attention_style)]
            ], colWidths=[7.5*inch]).setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef3c7')),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('BORDER', (0, 0), (-1, -1), 1.5, yellow_warning),
                ('LEFTBORDER', (0, 0), (-1, -1), 4, yellow_warning),
            ])))
            
            elements.append(Spacer(1, 20))
            
            # ===== TABELA DE BENEFICIÁRIOS =====
            if resultado.get('beneficiarios'):
                elements.append(Paragraph("Detalhamento por Beneficiário", section_title))
                
                if desconto_pct and desconto_pct > 0:
                    data = [['Idade', 'Faixa Etária', 'Valor Base', 'Desconto', 'Valor Final']]
                else:
                    data = [['Idade', 'Faixa Etária', 'Valor']]
                
                for ben in resultado['beneficiarios']:
                    valor_formatado = f"R$ {ben['valor']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
                    
                    if desconto_pct and desconto_pct > 0:
                        valor_num = float(ben['valor'])
                        desconto_val = valor_num * desconto_pct / 100.0
                        valor_desc = max(0.0, valor_num - desconto_val)
                        desconto_fmt = f"R$ {desconto_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
                        valor_desc_fmt = f"R$ {valor_desc:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
                        data.append([
                            str(ben['idade']),
                            ben['faixa_etaria_usada'],
                            valor_formatado,
                            desconto_fmt,
                            valor_desc_fmt
                        ])
                    else:
                        data.append([
                            str(ben['idade']),
                            ben['faixa_etaria_usada'],
                            valor_formatado
                        ])
                
                colwidths = [1.0*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch] if desconto_pct > 0 else [1.5*inch, 2.0*inch, 2.0*inch]
                
                table_ben = Table(data, colWidths=colwidths)
                table_ben.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), blue_primary),
                    ('TEXTCOLOR', (0, 0), (-1, 0), white),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('TOPPADDING', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                    ('BACKGROUND', (0, 1), (-1, -1), blue_light),
                    ('GRID', (0, 0), (-1, -1), 0.5, slate300),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [blue_light, white]),
                ]))
                
                elements.append(table_ben)
                elements.append(Spacer(1, 15))
            
            # ===== CARÊNCIAS =====
            if resultado.get('carencias'):
                elements.append(Paragraph("Carências", section_title))
                
                # Cards de carências em grid
                carencia_data = []
                row = []
                for i, car in enumerate(resultado['carencias']):
                    dias_texto = Paragraph(f"<b>{car['dias']}</b>", normal_style)
                    descricao_texto = Paragraph(car['descricao'], small_style)
                    
                    celula_content = Table([[dias_texto], [descricao_texto]], colWidths=[3.3*inch])
                    celula_content.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ]))
                    row.append(celula_content)
                    
                    if (i + 1) % 2 == 0 or i == len(resultado['carencias']) - 1:
                        carencia_data.append(row)
                        row = []
                
                if row:
                    carencia_data.append(row)
                
                carencia_widths = [3.5*inch] * len(row) if row else [3.5*inch] * 2
                
                carencia_table = Table(carencia_data, colWidths=carencia_widths)
                carencia_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), blue_light),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor('#d4dcff')),
                    ('TOPPADDING', (0, 0), (-1, -1), 15),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                ]))
                
                elements.append(carencia_table)
                elements.append(Spacer(1, 15))
            
            # ===== COPARTICIPAÇÕES =====
            if resultado.get('coparticipacoes'):
                elements.append(Paragraph("Coparticipação", section_title))
                
                for cop in resultado['coparticipacoes']:
                    texto = f"<b>{cop.get('nome', 'N/A')}</b>"
                    if cop.get('tipo_servico'):
                        texto += f" - {cop['tipo_servico']}"
                    if cop.get('percentual'):
                        texto += f" ({cop['percentual']}%)"
                    
                    cop_para = Paragraph(texto, normal_style)
                    cop_table = Table([[Paragraph("✓", ParagraphStyle('', parent=normal_style, textColor=green_success, fontSize=14)), cop_para]], colWidths=[0.4*inch, 7.1*inch])
                    cop_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), slate100),
                        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 10),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                        ('TOPPADDING', (0, 0), (-1, -1), 8),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                        ('BORDER', (0, 0), (-1, -1), 0.5, slate300),
                        ('LEFTBORDER', (0, 0), (-1, -1), 3, blue_primary),
                    ]))
                    elements.append(cop_table)
                    elements.append(Spacer(1, 8))
                
                elements.append(Spacer(1, 7))
            
            # ===== HOSPITAIS =====
            if resultado.get('hospitais'):
                elements.append(Paragraph("Hospitais Credenciados", section_title))
                
                for hosp in resultado['hospitais']:
                    hosp_nome = Paragraph(f"<b>{hosp['nome']}</b>", normal_style)
                    hosp_endereco = Paragraph(hosp.get('endereco', ''), small_style) if hosp.get('endereco') else Paragraph("", small_style)
                    
                    hosp_para = Table([[hosp_nome], [hosp_endereco]], colWidths=[7.0*inch])
                    hosp_para.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ]))
                    hosp_table = Table([[Paragraph("✓", ParagraphStyle('', parent=normal_style, textColor=green_success, fontSize=14)), hosp_para]], colWidths=[0.4*inch, 7.1*inch])
                    hosp_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), slate100),
                        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 10),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                        ('TOPPADDING', (0, 0), (-1, -1), 8),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                        ('BORDER', (0, 0), (-1, -1), 0.5, slate300),
                        ('LEFTBORDER', (0, 0), (-1, -1), 3, blue_primary),
                    ]))
                    elements.append(hosp_table)
                    elements.append(Spacer(1, 8))
                
                elements.append(Spacer(1, 7))
            
            # ===== MUNICÍPIOS =====
            if resultado.get('municipios'):
                elements.append(Paragraph("Municípios Atendidos", section_title))
                
                municipios_texto = ", ".join([m['nome'] for m in resultado['municipios']])
                mun_para = Paragraph(municipios_texto, normal_style)
                mun_table = Table([[Paragraph("✓", ParagraphStyle('', parent=normal_style, textColor=green_success, fontSize=14)), mun_para]], colWidths=[0.4*inch, 7.1*inch])
                mun_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), slate100),
                    ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BORDER', (0, 0), (-1, -1), 0.5, slate300),
                    ('LEFTBORDER', (0, 0), (-1, -1), 3, blue_primary),
                ]))
                elements.append(mun_table)
                elements.append(Spacer(1, 15))
            
            # ===== LINK REDE CREDENCIADA =====
            if resultado.get('rede_credenciada_url'):
                elements.append(Paragraph("Consulte a Rede Credenciada", section_title))
                elements.append(Paragraph("Acesse a plataforma para visualizar a lista completa de hospitais, clínicas e laboratórios parceiros:", normal_style))
                elements.append(Spacer(1, 5))
                elements.append(Paragraph(f"<link href='{resultado['rede_credenciada_url']}'><b>{resultado['rede_credenciada_url']}</b></link> →", ParagraphStyle('', parent=normal_style, textColor=blue_primary, fontSize=11)))
                elements.append(Spacer(1, 15))
    
    # ===== RODAPÉ =====
    elements.append(Spacer(1, 20))
    footer_table = Table([
        [Paragraph("📄 Documento gerado automaticamente pelo Sistema de Cotação em " + data_geracao, ParagraphStyle('', parent=normal_style, fontSize=9, textColor=slate700, alignment=TA_CENTER))],
        [Paragraph("Esta cotação é válida por 7 dias. Depois disso, solicite uma nova cotação.", ParagraphStyle('', parent=normal_style, fontSize=8, textColor=colors.grey, alignment=TA_CENTER))]
    ], colWidths=[7.5*inch])
    
    footer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), slate100),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BORDER', (0, 0), (-1, -1), 0.5, slate300),
    ]))
    
    elements.append(footer_table)
    
    # Construir PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer




#Alterações futuras podem incluir a adição de gráficos, logotipos personalizados e outros elementos visuais para melhorar a apresentação do PDF.