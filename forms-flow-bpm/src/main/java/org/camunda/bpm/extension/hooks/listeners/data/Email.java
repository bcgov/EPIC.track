package org.camunda.bpm.extension.hooks.listeners.data;

import java.util.List;

public class Email {
    private List<String> bcc;
    private String bodyType;
    private String body;
    private List<String> cc;
    private String delayTS;
    private String encoding;
    private String from;
    private String priority;
    private String subject;
    private List<String> to;
    private String tag;
    private Attachments attachments;
    public List<String> getBcc() {
        return bcc;
    }
    public void setBcc(List<String> bcc) {
        this.bcc = bcc;
    }
    public String getBodyType() {
        return bodyType;
    }
    public void setBodyType(String bodyType) {
        this.bodyType = bodyType;
    }
    public String getBody() {
        return body;
    }
    public void setBody(String body) {
        this.body = body;
    }
    public List<String> getCc() {
        return cc;
    }
    public void setCc(List<String> cc) {
        this.cc = cc;
    }
    public String getDelayTS() {
        return delayTS;
    }
    public void setDelayTS(String delayTS) {
        this.delayTS = delayTS;
    }
    public String getEncoding() {
        return encoding;
    }
    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }
    public String getFrom() {
        return from;
    }
    public void setFrom(String from) {
        this.from = from;
    }
    public String getPriority() {
        return priority;
    }
    public void setPriority(String priority) {
        this.priority = priority;
    }
    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }
    public List<String> getTo() {
        return to;
    }
    public void setTo(List<String> to) {
        this.to = to;
    }
    public String getTag() {
        return tag;
    }
    public void setTag(String tag) {
        this.tag = tag;
    }
    public Attachments getAttachments() {
        return attachments;
    }
    public void setAttachments(Attachments attachments) {
        this.attachments = attachments;
    }
}
