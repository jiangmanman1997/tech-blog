# 容器化部署的轻量之道

在云原生时代，容器化已成为应用交付的标准范式。相比传统虚拟机，容器共享宿主机内核，启动时间从分钟级降至毫秒级，资源开销减少近一个数量级。

## 多阶段构建

以 Docker 为例，一个典型的 Go 服务镜像可控制在 10MB 以内。关键在于多阶段构建：

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.19
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]