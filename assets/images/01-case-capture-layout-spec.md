# WargaSiaga Case Capture Layout Specification

## Purpose

Every guide detail must show a readable example of the suspicious communication pattern. The example is a fictional reconstruction informed by documented Indonesian cases, never a copied victim conversation and never proof that a specific sender is fraudulent.

## Placement

The evidence-learning block appears immediately after the guide heading and primary actions, before the warning-sign list.

Desktop composition:

- left column: 4:5 reconstructed phone/email/call capture;
- right column: small contextual 3:2 image, heading, and three numbered explanations;
- numbers 1–3 in the capture map exactly to numbers 1–3 in the explanation;
- source link and reconstruction disclaimer sit below the explanations.

Mobile composition:

- reconstruction first, at full available width;
- contextual image second;
- numbered explanation beneath it;
- no horizontal scrolling and no text smaller than the equivalent of 16 CSS pixels at the rendered mobile width.

## Asset contract

- SVG artboard: 800×1000, ratio 4:5;
- generic interface only; do not reproduce WhatsApp, Instagram, Telegram, Gmail, bank, marketplace, courier, game, or government trademarks;
- no real phone number, email, account number, person, company, or URL;
- reserved `.example` domains only;
- use masked placeholders such as `+62 8••• •••• 1042` and `•••• 7712`;
- exact Indonesian copy with no generative text artifacts;
- preserve at least 56 px outer padding and 42 px phone-frame padding;
- purple is used for WargaSiaga labeling; amber/red only marks risky phrases; teal marks verification guidance;
- each image includes the visible label `REKONSTRUKSI EDUKASI`.

## Accessibility

- every SVG is accompanied by a scenario-specific `alt` string;
- the adjacent numbered HTML list repeats and explains all visual warning markers;
- no instruction is available only inside the image;
- the image caption says that the reconstruction is not an authentic chat and not proof of fraud;
- source links point to research used to model the pattern, not to a claim that the fictional wording is a quotation.

## Interaction

- no zoom is required at standard mobile widths;
- clicking the image opens a native dialog with the larger image, caption, and transcript;
- the dialog closes by close button, backdrop click, or Escape and returns focus to the trigger;
- users who do not open the dialog still receive the complete explanation beside the image.

## Why reconstructed captures are preferred

Public screenshots frequently contain identifiable phone numbers, account details, usernames, faces, private conversations, news watermarks, and copyrighted interfaces. Rebuilding the observed pattern lets WargaSiaga teach the same warning signs without redistributing victim data or implying that a copied screenshot is a universal template.
