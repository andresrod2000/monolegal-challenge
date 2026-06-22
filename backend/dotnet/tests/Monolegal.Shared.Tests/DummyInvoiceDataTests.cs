using Monolegal.Shared;

namespace Monolegal.Shared.Tests;

public class DummyInvoiceDataTests
{
    private static readonly DateTime Today = new(2026, 6, 16, 15, 30, 0, DateTimeKind.Utc);

    [Fact]
    public void DiffDaysFromToday_SameDay_ReturnsZero()
    {
        Assert.Equal(0, DummyInvoiceData.DiffDaysFromToday(Today, Today));
    }

    [Fact]
    public void DiffDaysFromToday_PastDate_ReturnsNegative()
    {
        Assert.Equal(-2, DummyInvoiceData.DiffDaysFromToday(DummyInvoiceData.AddDays(Today, -2), Today));
    }

    [Fact]
    public void DiffDaysFromToday_FutureDate_ReturnsPositive()
    {
        Assert.Equal(5, DummyInvoiceData.DiffDaysFromToday(DummyInvoiceData.AddDays(Today, 5), Today));
    }

    [Fact]
    public void DeriveStatusFromDueDate_TodayAndFuture_ReturnsAlDia()
    {
        Assert.Equal(InvoiceStatus.AlDia, DummyInvoiceData.DeriveStatusFromDueDate(Today, Today));
        Assert.Equal(InvoiceStatus.AlDia, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, 10), Today));
    }

    [Fact]
    public void DeriveStatusFromDueDate_FirstReminderRange()
    {
        Assert.Equal(InvoiceStatus.PrimerRecordatorio, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, -1), Today));
        Assert.Equal(InvoiceStatus.PrimerRecordatorio, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, -7), Today));
    }

    [Fact]
    public void DeriveStatusFromDueDate_SecondReminderRange()
    {
        Assert.Equal(InvoiceStatus.SegundoRecordatorio, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, -8), Today));
        Assert.Equal(InvoiceStatus.SegundoRecordatorio, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, -21), Today));
    }

    [Fact]
    public void DeriveStatusFromDueDate_Deactivated()
    {
        Assert.Equal(InvoiceStatus.Desactivado, DummyInvoiceData.DeriveStatusFromDueDate(DummyInvoiceData.AddDays(Today, -22), Today));
    }

    [Fact]
    public void StartOfDay_ZerosTime()
    {
        var date = DummyInvoiceData.StartOfDay(new DateTime(2026, 6, 16, 23, 59, 59, DateTimeKind.Utc));
        Assert.Equal(0, date.Hour);
        Assert.Equal(0, date.Minute);
        Assert.Equal(0, date.Second);
    }
}
