package com.drms.sharingservice.service;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class AuditEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    @RabbitListener(queues = "drms.sharing.audit")
    public void onEvent(Map<String, Object> event) {
        log.info("Sharing service observed event: {}", event);
    }
}
