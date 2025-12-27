import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketService } from '../../../core/services/ticket';
import { of } from 'rxjs';
import { TicketList } from './ticket-list';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TicketList', () => {
  let component: TicketList;
  let fixture: ComponentFixture<TicketList>;
  let mockTicketService: any;

  const mockTickets = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      title: `Ticket ${i + 1}`,
      description: 'Desc',
      priority: 1,
      status: 0,
    }));

  beforeEach(async () => {
    mockTicketService = {
      getTickets: jasmine.createSpy('getTickets').and.returnValue(of(mockTickets)),
    };

    await TestBed.configureTestingModule({
      imports: [TicketList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TicketService, useValue: mockTicketService },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketList);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debería mostrar solo 5 tickets por página (paginación)', () => {
    // Verificamos que aunque hay 10 en el signal base, la paginada tiene 5
    expect(component.paginatedTickets().length).toBe(5);
  });

  it('debería cambiar de página correctamente', () => {
    component.goToPage(2);
    expect(component.currentPage()).toBe(2);
    // El primer ticket de la página 2 debería ser el ID 6
    expect(component.paginatedTickets()[0].id).toBe(6);
  });
});
