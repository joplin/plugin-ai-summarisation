# 🤖 Joplin AI - Summarisation

<br>

#### a. By Ton Hoang Nguyen (Bill) 🧑‍💻: https://github.com/HahaBill

#### b. Google Summer of Code 2024: https://summerofcode.withgoogle.com/programs/2024/projects/Ble8LKDb

#### c. Project Website: https://discourse.joplinapp.org/c/gsoc-projects/summarize-ai/35

<br>

## 1. Introduction

### 1.1 Motivation

The project aims to create note summaries to help users synthesize main ideas and arguments to identify salient points. This means that users will have a clear idea of what the note is about in a short piece of text with less mental effort.

#### Example Use Cases:

- Assist in processing notes to improve efficiency: Distill critical information from
  notes, highlight key ideas and quickly skim notes.
- Classify or cluster notes by their contents: Summarize key concepts from notes
  and use them in similar group notes. This could be used for tagging notes.
- Distill important information from long notes to empower solutions such as
  search, question, and answer.

### 1.2 Types of Summaries

There are two main types of summarization: extractive and abstractive

● **Extractive summarization**: This method takes sentences directly from the original
note, depending on their importance. The summary obtained contains exact
sentences from the original text.

● **Abstractive summarization**: Abstractive summarization is closer to what a human
usually does — i.e., conceive the text, compare it with their memory and related
information, and then re-create its core in a brief text.

Abstractive summarization tends to be more computationally expensive since you must utilize neural networks and generative systems. On the other hand, extractive summarization does not require the use of deep learning and data labeling [1].

[Work in progress...]

# References

[1] IBM - Text Summarization https://www.ibm.com/topics/text-summarization

[2] Automatic Text Summarization Methods: https://arxiv.org/abs/2204.01849
