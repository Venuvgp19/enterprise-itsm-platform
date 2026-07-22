import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    bg_color = RGBColor(11, 15, 25)          # Dark Slate
    card_bg = RGBColor(18, 24, 38)           # Card Panel
    title_color = RGBColor(255, 255, 255)    # White
    text_color = RGBColor(203, 213, 225)     # Slate 300
    brand_blue = RGBColor(99, 102, 241)      # Indigo 500
    accent_emerald = RGBColor(16, 185, 129)  # Emerald 500
    accent_amber = RGBColor(245, 158, 11)    # Amber 500

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = bg_color
        bg.line.fill.background()

    def add_header(slide, title_text, category_text="ENTERPRISE ITSM PLATFORM"):
        apply_background(slide)
        
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = brand_blue

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.733), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = title_color

    # SLIDE 1: Title Slide
    slide1 = prs.slides.add_slide(blank_layout)
    apply_background(slide1)

    # Accent Glow shape
    accent_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.2))
    accent_box.fill.solid()
    accent_box.fill.fore_color.rgb = card_bg
    accent_box.line.color.rgb = brand_blue

    tf1 = accent_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Enterprise IT Service Management (ITSM) Platform"
    p1.font.size = Pt(32)
    p1.font.bold = True
    p1.font.color.rgb = title_color

    p2 = tf1.add_paragraph()
    p2.text = "\nNext-Gen Autonomous AI Ticket Routing & Continuous Knowledge Base Architecture"
    p2.font.size = Pt(18)
    p2.font.color.rgb = brand_blue

    p3 = tf1.add_paragraph()
    p3.text = "\n\n• Continuous Agentic AI Ticket Router (NVIDIA Nemotron 3 550B LLM)\n• Continuous Knowledge Base & KEDB Synthesizer (Meta Llama 3.3 70B LLM)\n• 100% Persistent JSON Database File (Zero Data Loss on Restart)\n• Native Stdio Model Context Protocol (MCP) Server Integration"
    p3.font.size = Pt(14)
    p3.font.color.rgb = text_color

    # SLIDE 2: Live Dashboard Overview
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "1. Live Dashboard & Command Center Overview", "EXECUTIVE SERVICE MANAGEMENT DEMO")

    img_path_dash = "docs/screenshots/dashboard_overview.png"
    if os.path.exists(img_path_dash):
        slide2.shapes.add_picture(img_path_dash, Inches(0.8), Inches(1.4), width=Inches(8.2))

    card2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.4), Inches(3.3), Inches(5.4))
    card2.fill.solid()
    card2.fill.fore_color.rgb = card_bg
    card2.line.color.rgb = brand_blue
    tf2 = card2.text_frame
    tf2.word_wrap = True

    p = tf2.paragraphs[0]
    p.text = "Dashboard Highlights"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = accent_emerald

    bullets2 = [
      "100% Dynamic Synchronization with backend database file (`incidents.json`).",
      "Total Database Incidents metric tracks 1,000+ persistent records.",
      "Live Unassigned Queue countdown reflects real-time AI Router progress.",
      "Real-time Active Incident Stream table with direct clickable links.",
      "98.4%+ SLA target compliance monitoring across P1 & P2 tickets."
    ]
    for b in bullets2:
        pb = tf2.add_paragraph()
        pb.text = f"\n• {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = text_color

    # SLIDE 3: Agentic AI Ticket Router Terminal Logs
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "2. Agentic AI Ticket Router (NVIDIA Nemotron 3 550B LLM)", "AUTONOMOUS ITIL TRIAGE ENGINE")

    img_path_ai = "docs/screenshots/ai_router_terminal.png"
    if os.path.exists(img_path_ai):
        slide3.shapes.add_picture(img_path_ai, Inches(0.8), Inches(1.5), width=Inches(8.2))

    card3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.5), Inches(3.3), Inches(5.3))
    card3.fill.solid()
    card3.fill.fore_color.rgb = card_bg
    card3.line.color.rgb = brand_blue
    tf3 = card3.text_frame
    tf3.word_wrap = True

    p = tf3.paragraphs[0]
    p.text = "AI Router Features"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = accent_amber

    bullets3 = [
      "Continuous Background Monitoring: Scans unassigned queue every 10 seconds.",
      "NVIDIA Nemotron 3 550B LLM performs multi-factor diagnostic reasoning.",
      "Strict ITIL Group Routing (Unix, Network Ops, App Support, SecOps, DBA).",
      "High-Availability Rule Engine Fallback guarantees 96%+ routing uptime.",
      "Automatic execution logs emitted directly in NestJS console."
    ]
    for b in bullets3:
        pb = tf3.add_paragraph()
        pb.text = f"\n• {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = text_color

    # SLIDE 4: Incident Console & Triage Queue
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "3. Incident Management Console & Triage Queue", "ITIL PROCESS EXECUTION")

    img_path_list = "docs/screenshots/incident_list.png"
    if os.path.exists(img_path_list):
        slide4.shapes.add_picture(img_path_list, Inches(0.8), Inches(1.4), width=Inches(8.2))

    card4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.4), Inches(3.3), Inches(5.4))
    card4.fill.solid()
    card4.fill.fore_color.rgb = card_bg
    card4.line.color.rgb = brand_blue
    tf4 = card4.text_frame
    tf4.word_wrap = True

    p = tf4.paragraphs[0]
    p.text = "Console Capabilities"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = brand_blue

    bullets4 = [
      "1,000+ Record Database view powered by single source of truth.",
      "Multi-field search filter by Ticket ID, Title, Group, or Assigned Tech.",
      "Real-time counters for Unassigned Queue, Assigned & Resolved, and P1s.",
      "ITIL Impact x Urgency matrix automatically calculates P1 - P4 priorities.",
      "Direct integration with NestJS REST API (`GET /api/v1/incidents`)."
    ]
    for b in bullets4:
        pb = tf4.add_paragraph()
        pb.text = f"\n• {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = text_color

    # SLIDE 5: Incident Detail & Agentic AI Work Notes
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "4. Incident Detail & Agentic AI Work Notes Log", "DIAGNOSTIC WORKFLOW & AUDIT TRAIL")

    img_path_det = "docs/screenshots/incident_detail.png"
    if os.path.exists(img_path_det):
        slide5.shapes.add_picture(img_path_det, Inches(0.8), Inches(1.4), width=Inches(8.2))

    card5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.4), Inches(3.3), Inches(5.4))
    card5.fill.solid()
    card5.fill.fore_color.rgb = card_bg
    card5.line.color.rgb = brand_blue
    tf5 = card5.text_frame
    tf5.word_wrap = True

    p = tf5.paragraphs[0]
    p.text = "Activity Log Audit"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = accent_emerald

    bullets5 = [
      "Agentic AI Router posts internal Department Work Notes automatically.",
      "Includes reasoning text, target group, assigned lead, and confidence score.",
      "ITIL Close Codes (Kernel Patch, DB Vacuum, SSO Fix, BGP Reset).",
      "SLA Target Metrics timer (Response SLA & Resolution SLA).",
      "Persistent activity timeline preserved in database file."
    ]
    for b in bullets5:
        pb = tf5.add_paragraph()
        pb.text = f"\n• {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = text_color

    # SLIDE 6: Knowledge Base & KEDB Synthesizer
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "5. Continuous Knowledge Base (Meta Llama 3.3 70B)", "AUTONOMOUS KNOWLEDGE SYNTHESIS")

    img_path_kb = "docs/screenshots/knowledge_base.png"
    if os.path.exists(img_path_kb):
        slide6.shapes.add_picture(img_path_kb, Inches(0.8), Inches(1.4), width=Inches(8.2))

    card6 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.4), Inches(3.3), Inches(5.4))
    card6.fill.solid()
    card6.fill.fore_color.rgb = card_bg
    card6.line.color.rgb = brand_blue
    tf6 = card6.text_frame
    tf6.word_wrap = True

    p = tf6.paragraphs[0]
    p.text = "Knowledge Synthesizer"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = accent_amber

    bullets6 = [
      "Continuous Background AI Worker running in NestJS backend.",
      "Scans 1,000 incident diagnostic notes in 10-ticket batches.",
      "Synthesizes Standard Operating Procedures (SOPs) & KEDB workarounds.",
      "Meta Llama 3.3 70B Instruct LLM powers intelligent synthesis.",
      "Live progress bar tracks 100% completion across 1,000 tickets."
    ]
    for b in bullets6:
        pb = tf6.add_paragraph()
        pb.text = f"\n• {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = text_color

    # Save Presentation
    output_pptx = "Enterprise_ITSM_Platform_Presentation.pptx"
    prs.save(output_pptx)
    print(f"PowerPoint presentation successfully saved to: {output_pptx}")

if __name__ == '__main__':
    build_presentation()
