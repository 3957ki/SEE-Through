package com.seethrough.api.common.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ExecutionTimeAspect {

	private final Logger logger = LoggerFactory.getLogger(this.getClass());

	@Around("execution(* com.seethrough.api.*.presentation.*Controller.*(..))")
	public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
		long startTime = System.currentTimeMillis();

		Object result = joinPoint.proceed();

		long endTime = System.currentTimeMillis();
		long executionTime = endTime - startTime;

		String fullClassName = joinPoint.getSignature().getDeclaringTypeName();
		String simpleClassName = fullClassName.substring(fullClassName.lastIndexOf('.') + 1);
		String methodName = joinPoint.getSignature().getName();

		logger.info("[ExecutionTimeAspect] {}#{} 실행 시간: {}ms", simpleClassName, methodName, executionTime);

		return result;
	}
}